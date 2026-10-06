package com.theprimefit.app;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.app.NotificationManager;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintManager;
import android.view.View;
import android.view.Window;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;


/** Hosts The Prime Fit web app (diet charts in assets/www, clinic admin in assets/www/admin) in a full-screen WebView. */
public class MainActivity extends Activity {
    private static final int REQUEST_SAVE = 1;
    private static final int REQUEST_OPEN = 2;
    private static final int REQUEST_NOTIFY = 3;
    private String pendingOpen;

    private WebView webView;
    private String pendingFileContent;
    private byte[] pendingFileBytes;
    private String pendingMime;
    private ValueCallback<Uri[]> fileCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        pendingOpen = getIntent() == null ? null : getIntent().getStringExtra("open");
        webView = new WebView(this);
        webView.setBackgroundColor(0xFF06291F); // same emerald as the launch animation: no white flash
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true); // remembers the last profile via localStorage
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setTextZoom(100);
        // Always 100%: no pinch zoom and no zoomed-out overview of wide pages.
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(false);
        webView.setInitialScale(0);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                if ("file".equals(url.getScheme())) return false;
                // Open any external link in the browser rather than inside the app.
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, url));
                } catch (Exception ignored) {
                }
                return true;
            }
        });
        // <input type="file">: upload last week's chart PDF, import a backup.
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                // accept="image/*,application/pdf" may arrive as one string or as several entries.
                java.util.List<String> mimes = new java.util.ArrayList<>();
                String[] types = params.getAcceptTypes();
                if (types != null) for (String t : types) {
                    if (t == null) continue;
                    for (String m : t.split(",")) if (m.trim().contains("/")) mimes.add(m.trim());
                }
                if (mimes.size() == 1) intent.setType(mimes.get(0));
                else {
                    intent.setType("*/*");
                    if (!mimes.isEmpty()) intent.putExtra(Intent.EXTRA_MIME_TYPES, mimes.toArray(new String[0]));
                }
                try {
                    startActivityForResult(intent, REQUEST_OPEN);
                } catch (Exception e) {
                    fileCallback = null;
                    Toast.makeText(MainActivity.this, "No app available to open files", Toast.LENGTH_LONG).show();
                    return false;
                }
                return true;
            }
        });
        webView.addJavascriptInterface(new Bridge(), "AndroidBridge");
        setContentView(webView);

        if (savedInstanceState != null) webView.restoreState(savedInstanceState);
        else {
            // The start page is named in res/values/strings.xml.
            int id = getResources().getIdentifier("start_page", "string", getPackageName());
            webView.loadUrl("file:///android_asset/" + (id != 0 ? getString(id) : "www/index.html"));
        }
    }

    // A tapped notification while the app is open: go straight to that screen.
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        String open = intent == null ? null : intent.getStringExtra("open");
        if (open == null || open.isEmpty()) return;
        pendingOpen = open;
        webView.evaluateJavascript("window.__tpfOpen && window.__tpfOpen()", null);
    }

    /** Local network address (Wi-Fi or mobile data) of this phone, for the sign-in log. */
    private static String localIp() {
        try {
            for (java.net.NetworkInterface ni : java.util.Collections.list(java.net.NetworkInterface.getNetworkInterfaces())) {
                if (!ni.isUp() || ni.isLoopback()) continue;
                for (java.net.InetAddress a : java.util.Collections.list(ni.getInetAddresses())) {
                    if (a instanceof java.net.Inet4Address && !a.isLoopbackAddress()) return a.getHostAddress();
                }
            }
        } catch (Exception ignored) {
        }
        return "";
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }

    private long lastBack;

    // Back: the page handles it first (close a dialog, go to the previous screen). Only on the
    // home screen does back leave the app, and only when pressed twice.
    @Override
    public void onBackPressed() {
        webView.evaluateJavascript("(window.hdvBack ? String(window.hdvBack()) : 'none')", new ValueCallback<String>() {
            @Override
            public void onReceiveValue(String handled) {
                if ("\"true\"".equals(handled)) return;
                if ("\"none\"".equals(handled) && webView.canGoBack()) { webView.goBack(); return; }
                long now = System.currentTimeMillis();
                if (now - lastBack < 2000) { finish(); return; }
                lastBack = now;
                Toast.makeText(MainActivity.this, "Press back again to exit", Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    protected void onDestroy() {
        webView.destroy();
        super.onDestroy();
    }

    /** Called from JavaScript; WebView has no window.print() or blob downloads. */
    private class Bridge {
        /**
         * Google Sheet requests made by the phone itself, not the web view: a page opened from the app's
         * own files can be refused by the browser's cross-site rules, and Apps Script answers with a
         * redirect. The reply comes back through window.__tpfHttp(id, status, text).
         */
        @JavascriptInterface
        public void http(final String id, final String method, final String address, final String body) {
            new Thread(new Runnable() {
                @Override
                public void run() {
                    Net.Reply r = Net.fetch(method, address, body);
                    final String js = "window.__tpfHttp && window.__tpfHttp(" + org.json.JSONObject.quote(id) + "," + r.status + "," + org.json.JSONObject.quote(r.text) + ")";
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() { if (!isFinishing() && !isDestroyed()) webView.evaluateJavascript(js, null); } // the app may have closed meanwhile
                    });
                }
            }).start();
        }

        /** This phone's name, model, Android version and local network address, for the sign-in log. */
        @JavascriptInterface
        public String deviceInfo() {
            org.json.JSONObject o = new org.json.JSONObject();
            try {
                String model = (Build.MANUFACTURER + " " + Build.MODEL).trim();
                String name = null;
                try { name = android.provider.Settings.Global.getString(getContentResolver(), "device_name"); } catch (Exception ignored) { }
                o.put("name", name == null || name.isEmpty() ? model : name);
                o.put("model", model);
                o.put("android", Build.VERSION.RELEASE);
                o.put("ip", localIp());
            } catch (Exception ignored) {
            }
            return o.toString();
        }

        /** Founder chat watch: the sheet link, the signed-in login and the last message seen. Empty url stops it. */
        @JavascriptInterface
        public void chatWatch(String url, String secret, String me, String seenAt) {
            android.content.SharedPreferences.Editor e = getSharedPreferences(ChatJob.PREFS, MODE_PRIVATE).edit();
            if (url == null || url.isEmpty() || me == null || me.isEmpty()) {
                e.clear().apply();
                ChatJob.cancel(MainActivity.this);
                return;
            }
            long seen = 0;
            try { seen = Long.parseLong(seenAt); } catch (Exception ignored) { }
            long old = getSharedPreferences(ChatJob.PREFS, MODE_PRIVATE).getLong("seen", 0);
            e.putString("url", url).putString("secret", secret == null ? "" : secret).putString("me", me).putLong("seen", Math.max(seen, old)).apply();
            ChatJob.schedule(MainActivity.this);
        }

        /** Messages up to this time have been seen in the app: the background check skips them. */
        @JavascriptInterface
        public void chatSeen(String seenAt) {
            try {
                long seen = Long.parseLong(seenAt);
                android.content.SharedPreferences p = getSharedPreferences(ChatJob.PREFS, MODE_PRIVATE);
                if (seen > p.getLong("seen", 0)) p.edit().putLong("seen", seen).apply();
            } catch (Exception ignored) {
            }
        }

        @JavascriptInterface
        public void showNotice(String title, String body, String open) {
            Notify.show(MainActivity.this, 2, title, body, open);
        }

        /** Android 13+: ask once for permission to show notifications. */
        @JavascriptInterface
        public void askNotify() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission("android.permission.POST_NOTIFICATIONS") != PackageManager.PERMISSION_GRANTED) {
                        requestPermissions(new String[] {"android.permission.POST_NOTIFICATIONS"}, REQUEST_NOTIFY);
                    }
                }
            });
        }

        @JavascriptInterface
        public boolean canNotify() {
            if (Build.VERSION.SDK_INT >= 33) return checkSelfPermission("android.permission.POST_NOTIFICATIONS") == PackageManager.PERMISSION_GRANTED;
            NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
            return nm == null || nm.areNotificationsEnabled();
        }

        /** A screen to open, from a tapped notification (read once). */
        @JavascriptInterface
        public String takeOpen() {
            String o = pendingOpen == null ? "" : pendingOpen;
            pendingOpen = null;
            return o;
        }

        @JavascriptInterface
        public void print(final String title) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    PrintManager pm = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                    String job = title == null || title.isEmpty() ? "ThePrimeFit-Diet-Chart" : title;
                    pm.print(job, webView.createPrintDocumentAdapter(job), new PrintAttributes.Builder()
                            .setMediaSize(PrintAttributes.MediaSize.ISO_A4).build());
                }
            });
        }

        @JavascriptInterface
        public void saveFile(final String fileName, final String mimeType, final String content) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    pendingFileContent = content;
                    pendingMime = mimeType;
                    Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    intent.setType(mimeType);
                    intent.putExtra(Intent.EXTRA_TITLE, fileName);
                    try {
                        startActivityForResult(intent, REQUEST_SAVE);
                    } catch (Exception e) {
                        pendingFileContent = null;
                        Toast.makeText(MainActivity.this, "No app available to save files", Toast.LENGTH_LONG).show();
                    }
                }
            });
        }

        /** Binary files (PDF, Excel) arrive base64-encoded from JavaScript. */
        @JavascriptInterface
        public void saveBase64(final String fileName, final String mimeType, final String base64) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        pendingFileBytes = android.util.Base64.decode(base64, android.util.Base64.DEFAULT);
                    } catch (Exception e) {
                        Toast.makeText(MainActivity.this, "Could not prepare the file", Toast.LENGTH_LONG).show();
                        return;
                    }
                    pendingFileContent = null;
                    pendingMime = mimeType;
                    Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    intent.setType(mimeType);
                    intent.putExtra(Intent.EXTRA_TITLE, fileName);
                    try {
                        startActivityForResult(intent, REQUEST_SAVE);
                    } catch (Exception e) {
                        pendingFileBytes = null;
                        Toast.makeText(MainActivity.this, "No app available to save files", Toast.LENGTH_LONG).show();
                    }
                }
            });
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_OPEN) {
            if (fileCallback == null) return;
            Uri uri = resultCode == RESULT_OK && data != null ? data.getData() : null;
            fileCallback.onReceiveValue(uri != null ? new Uri[] { uri } : null);
            fileCallback = null;
            return;
        }
        if (requestCode != REQUEST_SAVE) return;
        String content = pendingFileContent;
        byte[] bytes = pendingFileBytes;
        pendingFileContent = null;
        pendingFileBytes = null;
        if (resultCode != RESULT_OK || data == null || data.getData() == null || (content == null && bytes == null)) return;
        String mime = pendingMime;
        pendingMime = null;
        Uri saved = data.getData();
        try (OutputStream out = getContentResolver().openOutputStream(saved)) {
            out.write(bytes != null ? bytes : content.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            Toast.makeText(this, "Could not save file", Toast.LENGTH_LONG).show();
            return;
        }
        // Open a saved PDF or image straight away in the phone's viewer.
        if (mime != null && (mime.equals("application/pdf") || mime.startsWith("image/"))) {
            try {
                Intent view = new Intent(Intent.ACTION_VIEW);
                view.setDataAndType(saved, mime);
                view.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_DOCUMENT);
                startActivity(view);
                Toast.makeText(this, "Saved · opening", Toast.LENGTH_SHORT).show();
                return;
            } catch (Exception e) {
                Toast.makeText(this, "Saved. No app found to open it", Toast.LENGTH_LONG).show();
                return;
            }
        }
        Toast.makeText(this, "Saved", Toast.LENGTH_SHORT).show();
    }
}
