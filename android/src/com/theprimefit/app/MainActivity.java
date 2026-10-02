package com.theprimefit.app;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintManager;
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

    private WebView webView;
    private String pendingFileContent;
    private byte[] pendingFileBytes;
    private String pendingMime;
    private ValueCallback<Uri[]> fileCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        webView = new WebView(this);
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
                    int status = 0;
                    String text;
                    try {
                        String url = address;
                        boolean post = "POST".equals(method);
                        java.net.HttpURLConnection c = null;
                        for (int hop = 0; hop < 6; hop++) {
                            c = (java.net.HttpURLConnection) new java.net.URL(url).openConnection();
                            c.setInstanceFollowRedirects(false);
                            c.setConnectTimeout(20000);
                            c.setReadTimeout(60000);
                            if (post) {
                                c.setRequestMethod("POST");
                                c.setDoOutput(true);
                                c.setRequestProperty("Content-Type", "text/plain;charset=utf-8");
                                try (OutputStream o = c.getOutputStream()) { o.write(body == null ? new byte[0] : body.getBytes(StandardCharsets.UTF_8)); }
                            }
                            status = c.getResponseCode();
                            if (status < 300 || status > 399) break;
                            String next = c.getHeaderField("Location");
                            c.disconnect();
                            if (next == null) break;
                            url = new java.net.URL(new java.net.URL(url), next).toString();
                            post = false; // Apps Script: POST, then GET the answer from the redirect
                        }
                        java.io.InputStream in = status >= 400 ? c.getErrorStream() : c.getInputStream();
                        java.io.ByteArrayOutputStream buf = new java.io.ByteArrayOutputStream();
                        if (in != null) {
                            byte[] b = new byte[16384];
                            for (int n; (n = in.read(b)) > 0; ) buf.write(b, 0, n);
                            in.close();
                        }
                        c.disconnect();
                        text = new String(buf.toByteArray(), StandardCharsets.UTF_8);
                    } catch (Exception e) {
                        status = -1;
                        text = String.valueOf(e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage());
                    }
                    final String js = "window.__tpfHttp && window.__tpfHttp(" + org.json.JSONObject.quote(id) + "," + status + "," + org.json.JSONObject.quote(text) + ")";
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() { if (!isFinishing() && !isDestroyed()) webView.evaluateJavascript(js, null); } // the app may have closed meanwhile
                    });
                }
            }).start();
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
