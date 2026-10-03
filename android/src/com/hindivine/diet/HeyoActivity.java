package com.hindivine.diet;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

/**
 * Opens the MyOperator / Heyo panel in a normal logged-in WebView. A small script injected into the
 * panel copies every JSON response the panel loads (chat list, opened chats) to HeyoStore, so when the
 * user comes back the admin app can turn those chats into leads. The app makes no request of its own and
 * never reads the password — the panel logs in by itself, exactly as in a browser.
 */
public class HeyoActivity extends Activity {
    private WebView web;
    private TextView count;

    // Injected into the panel: wrap fetch and XMLHttpRequest so JSON replies are handed to the app.
    private static final String HOOK =
        "(function(){try{if(window.__hdvHeyo)return;window.__hdvHeyo=1;"
        + "var ok=function(u,t){try{if(!t||t.length<2)return;var s=t.trim()[0];if(s!=='{'&&s!=='[')return;"
        + "if(t.length>8000000)return;AndroidBridge.heyoData(String(u||''),t);}catch(e){}};"
        + "var of=window.fetch;if(of)window.fetch=function(){var a=arguments;return of.apply(this,a).then(function(r){try{"
        + "var u=(a[0]&&a[0].url)||a[0];var ct=r.headers.get('content-type')||'';if(ct.indexOf('json')>=0){r.clone().text().then(function(t){ok(u,t);});}}catch(e){}return r;});};"
        + "var op=XMLHttpRequest.prototype.open,os=XMLHttpRequest.prototype.send;"
        + "XMLHttpRequest.prototype.open=function(m,u){this.__u=u;return op.apply(this,arguments);};"
        + "XMLHttpRequest.prototype.send=function(){this.addEventListener('load',function(){try{"
        + "var ct=this.getResponseHeader('content-type')||'';if(ct.indexOf('json')>=0||String(this.responseText).trim()[0]==='{'||String(this.responseText).trim()[0]==='[')ok(this.__u,this.responseText);}catch(e){}});return os.apply(this,arguments);};"
        + "}catch(e){}})();";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        String url = getIntent().getStringExtra("url");
        if (url == null || url.isEmpty()) url = "https://my.myoperator.co/";

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(0xFF0A2F55);

        LinearLayout bar = new LinearLayout(this);
        bar.setOrientation(LinearLayout.HORIZONTAL);
        bar.setPadding(24, 18, 24, 18);
        count = new TextView(this);
        count.setTextColor(0xFFFFFFFF);
        count.setText("Open your chats — the app is reading them");
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f);
        count.setLayoutParams(lp);
        Button done = new Button(this);
        done.setText("Done");
        done.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { finish(); }
        });
        bar.addView(count);
        bar.addView(done);
        root.addView(bar, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));

        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, true);
        web.addJavascriptInterface(new Bridge(), "AndroidBridge");
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) { return false; }
            @Override public void onPageStarted(WebView view, String u, android.graphics.Bitmap f) { view.evaluateJavascript(HOOK, null); }
            @Override public void onPageFinished(WebView view, String u) { view.evaluateJavascript(HOOK, null); updateCount(); }
        });
        FrameLayout wrap = new FrameLayout(this);
        wrap.addView(web, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        root.addView(wrap, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f));
        setContentView(root);

        if (android.os.Build.VERSION.SDK_INT >= 35) {
            root.setOnApplyWindowInsetsListener(new View.OnApplyWindowInsetsListener() {
                @Override public android.view.WindowInsets onApplyWindowInsets(View v, android.view.WindowInsets insets) {
                    android.graphics.Insets i = insets.getInsets(android.view.WindowInsets.Type.systemBars()
                            | android.view.WindowInsets.Type.displayCutout() | android.view.WindowInsets.Type.ime());
                    v.setPadding(i.left, i.top, i.right, i.bottom);
                    return android.view.WindowInsets.CONSUMED;
                }
            });
        }
        web.loadUrl(url);
    }

    private void updateCount() {
        runOnUiThread(new Runnable() {
            @Override public void run() {
                int n = HeyoStore.pending();
                count.setText(n > 0 ? ("Read " + n + " — open more chats, then Done") : "Open your chats — the app is reading them");
            }
        });
    }

    @Override public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override protected void onDestroy() {
        if (web != null) {
            try { ((android.view.ViewGroup) web.getParent()).removeView(web); web.destroy(); } catch (Exception ignored) {}
            web = null;
        }
        super.onDestroy();
    }

    private class Bridge {
        @JavascriptInterface
        public void heyoData(String url, String body) {
            HeyoStore.add(url, body);
            updateCount();
        }
    }
}
