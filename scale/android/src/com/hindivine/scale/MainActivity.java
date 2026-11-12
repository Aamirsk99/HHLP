package com.hindivine.scale;

import android.Manifest;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.LocationManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.print.PrintAttributes;
import android.print.PrintManager;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayDeque;
import java.util.UUID;

/**
 * Hosts the Hindivine Scale web app (assets/www) in a WebView and gives it Bluetooth
 * Low Energy, which a WebView does not have. The scale protocol itself lives in
 * JavaScript (js/protocol.js); this class only scans, connects, subscribes and writes.
 */
public class MainActivity extends Activity {
    private static final int REQUEST_PERMISSION = 1;
    private static final int REQUEST_ENABLE_BT = 2;
    private static final UUID CCCD = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");
    private static final long SCAN_MS = 60000;
    private static final long CONNECT_MS = 12000;
    private static final int CONNECT_TRIES = 3;
    private static final long WATCH_MS = 10 * 60000;
    private static final int MAX_SUBSCRIPTIONS = 10;

    private WebView webView;
    private final Handler ui = new Handler(Looper.getMainLooper());

    private BluetoothAdapter adapter;
    private BluetoothLeScanner scanner;
    private boolean scanning;
    private String connectAddress;
    private int connectTries;
    private boolean servicesReady;
    private String watching; // address of a broadcast-only scale being listened to
    private final java.util.HashMap<String, String> lastAdv = new java.util.HashMap<String, String>();
    private final java.util.HashMap<String, Long> lastAdvAt = new java.util.HashMap<String, Long>();
    private BluetoothGatt gatt;
    private final ArrayDeque<Runnable> ops = new ArrayDeque<Runnable>();
    private boolean opBusy;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        BluetoothManager bm = (BluetoothManager) getSystemService(Context.BLUETOOTH_SERVICE);
        adapter = bm != null ? bm.getAdapter() : null;

        webView = new WebView(this);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setTextZoom(100);
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                if ("file".equals(url.getScheme())) return false;
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, url));
                } catch (Exception ignored) {
                }
                return true;
            }
        });
        webView.addJavascriptInterface(new Bridge(), "AndroidBridge");
        webView.addJavascriptInterface(new Ble(), "AndroidBle");
        setContentView(webView);
        webView.loadUrl("file:///android_asset/www/index.html");
    }

    @Override
    public void onBackPressed() {
        webView.evaluateJavascript("window.onAndroidBack ? window.onAndroidBack() : false", new android.webkit.ValueCallback<String>() {
            @Override
            public void onReceiveValue(String handled) {
                if (!"true".equals(handled)) finish();
            }
        });
    }

    @Override
    protected void onDestroy() {
        stopScanNow();
        closeGatt();
        webView.destroy();
        super.onDestroy();
    }

    // ── JavaScript → Android ─────────────────────────────────────────────

    private class Bridge {
        /** Send text (the machine data log) through WhatsApp, e-mail or any other app. */
        @JavascriptInterface
        public void share(final String subject, final String text) {
            ui.post(new Runnable() {
                @Override
                public void run() {
                    Intent send = new Intent(Intent.ACTION_SEND);
                    send.setType("text/plain");
                    send.putExtra(Intent.EXTRA_SUBJECT, subject);
                    send.putExtra(Intent.EXTRA_TEXT, text);
                    try {
                        startActivity(Intent.createChooser(send, subject));
                    } catch (Exception ignored) {
                    }
                }
            });
        }

        @JavascriptInterface
        public String version() {
            try {
                return getPackageManager().getPackageInfo(getPackageName(), 0).versionName + " · Android " + Build.VERSION.RELEASE + " · " + Build.MODEL;
            } catch (Exception e) {
                return "";
            }
        }

        @JavascriptInterface
        public void print(final String title) {
            ui.post(new Runnable() {
                @Override
                public void run() {
                    PrintManager pm = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                    String job = title == null || title.isEmpty() ? "Hindivine-Body-Report" : title;
                    pm.print(job, webView.createPrintDocumentAdapter(job), new PrintAttributes.Builder()
                            .setMediaSize(PrintAttributes.MediaSize.ISO_A4).build());
                }
            });
        }
    }

    private class Ble {
        @JavascriptInterface
        public void startScan() {
            ui.post(new Runnable() { @Override public void run() { watching = null; beginScan(); } });
        }

        /** Keep listening to one broadcast-only scale (it is never connected). */
        @JavascriptInterface
        public void watch(final String address) {
            ui.post(new Runnable() { @Override public void run() { watching = address; beginScan(); } });
        }

        @JavascriptInterface
        public void stopScan() {
            ui.post(new Runnable() { @Override public void run() { watching = null; stopScanNow(); } });
        }

        @JavascriptInterface
        public void connect(final String address) {
            ui.post(new Runnable() { @Override public void run() { connectTo(address); } });
        }

        @JavascriptInterface
        public void write(final String service, final String characteristic, final String hex) {
            ui.post(new Runnable() { @Override public void run() { queueWrite(service, characteristic, hex); } });
        }

        @JavascriptInterface
        public void disconnect() {
            ui.post(new Runnable() {
                @Override
                public void run() {
                    if (watching != null) { watching = null; stopScanNow(); }
                    connectAddress = null;
                    ui.removeCallbacks(connectTimeout);
                    if (gatt != null) gatt.disconnect();
                    else state("disconnected", "");
                }
            });
        }
    }

    // ── Android → JavaScript ─────────────────────────────────────────────

    private void emit(final String event, final JSONObject payload) {
        ui.post(new Runnable() {
            @Override
            public void run() {
                webView.evaluateJavascript("window.BleNative&&window.BleNative.emit(" + JSONObject.quote(event) + "," + payload + ")", null);
            }
        });
    }

    private void state(String state, String message) {
        try {
            emit("state", new JSONObject().put("state", state).put("message", message));
        } catch (Exception ignored) {
        }
    }

    // ── Scanning ─────────────────────────────────────────────────────────

    private void beginScan() {
        if (adapter == null) { state("error", "This phone has no Bluetooth."); return; }
        if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[] { Manifest.permission.ACCESS_FINE_LOCATION }, REQUEST_PERMISSION);
            return;
        }
        if (!adapter.isEnabled()) {
            try {
                startActivityForResult(new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE), REQUEST_ENABLE_BT);
            } catch (Exception e) {
                state("error", "Turn on Bluetooth and try again.");
            }
            return;
        }
        if (Build.VERSION.SDK_INT >= 28) {
            LocationManager lm = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
            if (lm != null && !lm.isLocationEnabled()) {
                state("error", "Turn on Location in the phone's quick settings. Android needs it to find Bluetooth machines.");
                return;
            }
        }
        scanner = adapter.getBluetoothLeScanner();
        if (scanner == null) { state("error", "Turn on Bluetooth and try again."); return; }
        lastAdv.clear();
        lastAdvAt.clear();
        // Android refuses more than five scan starts in 30 seconds, so a running scan is reused.
        if (!scanning) {
            try {
                scanner.startScan(null, new ScanSettings.Builder().setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY).build(), scanCallback);
                scanning = true;
            } catch (Exception e) {
                state("error", "Bluetooth search could not start. Turn Bluetooth off and on, then try again.");
                return;
            }
        }
        state(watching != null ? "watching" : "scanning", "");
        ui.removeCallbacks(scanTimeout);
        ui.postDelayed(scanTimeout, watching != null ? WATCH_MS : SCAN_MS);
    }

    private final Runnable scanTimeout = new Runnable() {
        @Override
        public void run() {
            if (!scanning) return;
            boolean wasWatching = watching != null;
            watching = null;
            stopScanNow();
            state(wasWatching ? "disconnected" : "scan-ended", "");
        }
    };

    private void stopScanNow() {
        ui.removeCallbacks(scanTimeout);
        if (!scanning) return;
        scanning = false;
        try {
            if (scanner != null) scanner.stopScan(scanCallback);
        } catch (Exception ignored) {
        }
    }

    private final ScanCallback scanCallback = new ScanCallback() {
        @Override
        public void onScanResult(int callbackType, ScanResult result) {
            try {
                String address = result.getDevice().getAddress();
                if (watching != null && !watching.equals(address)) return;
                byte[] record = result.getScanRecord() != null ? result.getScanRecord().getBytes() : null;
                String adv = manufacturerData(record);
                String name = result.getScanRecord() != null ? result.getScanRecord().getDeviceName() : null;
                if (name == null) name = result.getDevice().getName();
                name = name == null ? "" : name.trim();
                if (name.isEmpty() && adv.isEmpty()) return;
                // Advertisements repeat many times a second: pass on changes, and a heartbeat every second.
                long now = System.currentTimeMillis();
                Long at = lastAdvAt.get(address);
                if (adv.equals(lastAdv.get(address)) && at != null && now - at < 1000) return;
                lastAdv.put(address, adv);
                lastAdvAt.put(address, now);
                emit("device", new JSONObject().put("id", address).put("name", name).put("rssi", result.getRssi()).put("adv", adv));
            } catch (Exception ignored) {
            }
        }

        @Override
        public void onScanFailed(int errorCode) {
            scanning = false;
            state("error", errorCode == 6
                    ? "Android paused the Bluetooth search because it was started too often. Wait 30 seconds and try again."
                    : "Bluetooth search failed (code " + errorCode + "). Turn Bluetooth off and on, then try again.");
        }
    };

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] results) {
        if (requestCode != REQUEST_PERMISSION) return;
        if (results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED) beginScan();
        else state("error", "Allow the Location permission. Android needs it to find Bluetooth machines; the app does not read your location.");
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != REQUEST_ENABLE_BT) return;
        if (resultCode == RESULT_OK) beginScan();
        else state("error", "Bluetooth is off. Turn it on to connect the machine.");
    }

    // ── Connection ───────────────────────────────────────────────────────

    private void connectTo(String address) {
        watching = null;
        stopScanNow();
        connectAddress = address;
        connectTries = 0;
        state("connecting", "");
        openGatt();
    }

    /** One connection attempt. Android often fails the first try (status 133), so it is repeated. */
    private void openGatt() {
        closeGatt();
        servicesReady = false;
        connectTries++;
        log("connect try " + connectTries + " to " + connectAddress);
        try {
            BluetoothDevice device = adapter.getRemoteDevice(connectAddress);
            gatt = device.connectGatt(this, false, gattCallback, BluetoothDevice.TRANSPORT_LE);
            ui.removeCallbacks(connectTimeout);
            ui.postDelayed(connectTimeout, CONNECT_MS);
        } catch (Exception e) {
            state("error", "Could not connect to the machine.");
        }
    }

    private void retryOrFail(String why) {
        ui.removeCallbacks(connectTimeout);
        log(why);
        if (connectAddress != null && connectTries < CONNECT_TRIES) {
            closeGatt();
            ui.postDelayed(new Runnable() {
                @Override
                public void run() { if (connectAddress != null && gatt == null) openGatt(); }
            }, 700);
        } else {
            closeGatt();
            connectAddress = null;
            state("error", "Could not connect. Step on the machine so its display is on, close the MovingLife app if it is open, and try again.");
        }
    }

    private final Runnable connectTimeout = new Runnable() {
        @Override
        public void run() { if (!servicesReady && connectAddress != null) retryOrFail("no answer from the machine"); }
    };

    private void log(String line) {
        try {
            emit("log", new JSONObject().put("line", line));
        } catch (Exception ignored) {
        }
    }

    private void closeGatt() {
        ops.clear();
        opBusy = false;
        if (gatt != null) {
            try {
                gatt.close();
            } catch (Exception ignored) {
            }
            gatt = null;
        }
    }

    private void enqueue(Runnable op) {
        ops.add(op);
        if (!opBusy) nextOp();
    }

    private void nextOp() {
        ui.removeCallbacks(opTimeout);
        Runnable op = ops.poll();
        if (op == null) { opBusy = false; return; }
        opBusy = true;
        ui.postDelayed(opTimeout, 3000); // never let one lost callback block the queue
        op.run();
    }

    private final Runnable opTimeout = new Runnable() {
        @Override
        public void run() { nextOp(); }
    };

    private final Runnable opDone = new Runnable() {
        @Override
        public void run() { nextOp(); }
    };

    /** All manufacturer-specific (0xFF) parts of an advertisement, company-ID bytes included, as hex. */
    private static String manufacturerData(byte[] record) {
        StringBuilder sb = new StringBuilder();
        if (record == null) return "";
        int i = 0;
        while (i + 1 < record.length) {
            int len = record[i] & 0xff;
            if (len == 0 || i + len >= record.length) break;
            if ((record[i + 1] & 0xff) == 0xff) {
                for (int k = i + 2; k <= i + len; k++) sb.append(String.format("%02x", record[k] & 0xff));
            }
            i += len + 1;
        }
        return sb.toString();
    }

    private static String hex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        if (bytes != null) for (byte b : bytes) sb.append(String.format("%02x", b & 0xff));
        return sb.toString();
    }

    private static byte[] unhex(String hex) {
        byte[] out = new byte[hex.length() / 2];
        for (int i = 0; i < out.length; i++) out[i] = (byte) Integer.parseInt(hex.substring(i * 2, i * 2 + 2), 16);
        return out;
    }

    private void queueWrite(final String service, final String characteristic, final String hex) {
        enqueue(new Runnable() {
            @Override
            public void run() {
                boolean sent = false;
                try {
                    BluetoothGattService svc = gatt != null ? gatt.getService(UUID.fromString(service)) : null;
                    BluetoothGattCharacteristic ch = svc != null ? svc.getCharacteristic(UUID.fromString(characteristic)) : null;
                    if (ch != null) {
                        boolean withResponse = (ch.getProperties() & BluetoothGattCharacteristic.PROPERTY_WRITE) != 0;
                        ch.setWriteType(withResponse ? BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT : BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE);
                        ch.setValue(unhex(hex));
                        sent = gatt.writeCharacteristic(ch);
                    }
                } catch (Exception ignored) {
                }
                if (!sent) ui.post(opDone);
            }
        });
    }

    private void queueSubscribe(final BluetoothGattCharacteristic ch) {
        enqueue(new Runnable() {
            @Override
            public void run() {
                boolean sent = false;
                try {
                    gatt.setCharacteristicNotification(ch, true);
                    BluetoothGattDescriptor d = ch.getDescriptor(CCCD);
                    if (d != null) {
                        boolean notify = (ch.getProperties() & BluetoothGattCharacteristic.PROPERTY_NOTIFY) != 0;
                        d.setValue(notify ? BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE : BluetoothGattDescriptor.ENABLE_INDICATION_VALUE);
                        sent = gatt.writeDescriptor(d);
                    }
                } catch (Exception ignored) {
                }
                if (!sent) ui.post(opDone);
            }
        });
    }

    private final BluetoothGattCallback gattCallback = new BluetoothGattCallback() {
        @Override
        public void onConnectionStateChange(final BluetoothGatt g, final int status, final int newState) {
            ui.post(new Runnable() {
                @Override
                public void run() {
                    if (g != gatt) return;
                    log("gatt state " + newState + " status " + status);
                    if (newState == BluetoothProfile.STATE_CONNECTED) {
                        g.requestConnectionPriority(BluetoothGatt.CONNECTION_PRIORITY_HIGH);
                        ui.postDelayed(new Runnable() {
                            @Override
                            public void run() { if (g == gatt && !g.discoverServices()) retryOrFail("service discovery did not start"); }
                        }, 500);
                    } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                        if (!servicesReady && connectAddress != null) { retryOrFail("dropped while connecting (status " + status + ")"); return; }
                        ui.removeCallbacks(connectTimeout);
                        connectAddress = null;
                        closeGatt();
                        state("disconnected", "");
                    }
                }
            });
        }

        @Override
        public void onServicesDiscovered(final BluetoothGatt g, final int status) {
            ui.post(new Runnable() {
                @Override
                public void run() {
                    if (g != gatt) return;
                    if (status != BluetoothGatt.GATT_SUCCESS || g.getServices().isEmpty()) { retryOrFail("service discovery failed (status " + status + ")"); return; }
                    servicesReady = true;
                    ui.removeCallbacks(connectTimeout);
                    try {
                        JSONArray services = new JSONArray();
                        int subscribed = 0;
                        for (BluetoothGattService svc : g.getServices()) {
                            String su = svc.getUuid().toString();
                            JSONArray chars = new JSONArray();
                            boolean generic = su.startsWith("00001800") || su.startsWith("00001801");
                            for (BluetoothGattCharacteristic ch : svc.getCharacteristics()) {
                                int p = ch.getProperties();
                                chars.put(new JSONObject().put("uuid", ch.getUuid().toString()).put("props", p));
                                boolean pushes = (p & (BluetoothGattCharacteristic.PROPERTY_NOTIFY | BluetoothGattCharacteristic.PROPERTY_INDICATE)) != 0;
                                if (pushes && !generic && subscribed < MAX_SUBSCRIPTIONS) {
                                    queueSubscribe(ch);
                                    subscribed++;
                                }
                            }
                            services.put(new JSONObject().put("uuid", su).put("chars", chars));
                        }
                        // Runs after every subscription above, so the first command is not sent too early.
                        enqueue(new Runnable() {
                            @Override
                            public void run() {
                                state("connected", g.getDevice().getName() == null ? "" : g.getDevice().getName());
                                ui.post(opDone);
                            }
                        });
                        emit("services", new JSONObject().put("services", services));
                    } catch (Exception e) {
                        state("error", "Could not read the machine's Bluetooth services.");
                    }
                }
            });
        }

        @Override
        public void onCharacteristicChanged(BluetoothGatt g, BluetoothGattCharacteristic ch) {
            try {
                emit("notify", new JSONObject().put("char", ch.getUuid().toString()).put("hex", hex(ch.getValue())));
            } catch (Exception ignored) {
            }
        }

        @Override
        public void onDescriptorWrite(BluetoothGatt g, BluetoothGattDescriptor d, int status) {
            if (status != BluetoothGatt.GATT_SUCCESS) log("subscribe " + d.getCharacteristic().getUuid() + " failed, status " + status);
            ui.post(opDone);
        }

        @Override
        public void onCharacteristicWrite(BluetoothGatt g, BluetoothGattCharacteristic ch, int status) {
            if (status != BluetoothGatt.GATT_SUCCESS) log("write failed, status " + status);
            ui.post(opDone);
        }
    };
}
