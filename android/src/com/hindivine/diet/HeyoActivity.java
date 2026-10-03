package com.hindivine.diet;

import android.app.Activity;
import android.os.Bundle;
import android.os.Handler;
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
 * Opens the MyOperator / Heyo panel in a normal logged-in WebView and reads the chats two ways:
 *  1. a script wraps fetch / XMLHttpRequest / WebSocket so the panel's own JSON replies are copied, and
 *  2. a scraper reads the chat names and numbers straight off the screen and auto-scrolls to load more,
 * so it works whatever format MyOperator uses. Everything is kept in memory (HeyoStore) until the admin
 * app turns it into leads. The app makes no request of its own and never sees the password.
 */
public class HeyoActivity extends Activity {
    private WebView web;
    private TextView count;
    private final Handler handler = new Handler();
    private boolean hookReady;

    // Wrap fetch, XMLHttpRequest and WebSocket so every JSON the chat loads is handed to the app.
    private static final String HOOK =
        "(function(){try{if(window.__hdvHeyo)return;window.__hdvHeyo=1;"
        + "var ok=function(u,t){try{if(typeof t!=='string'||t.length<2)return;var s=t.trim();"
        + "if(/^\\d/.test(s)){var i=s.search(/[\\[{]/);if(i>0&&i<12)s=s.slice(i);}" // socket.io frame like 42["msg",{...}]
        + "var c=s.charAt(0);if(c!=='{'&&c!=='[')return;if(s.length>8000000)return;AndroidBridge.heyoData(String(u||''),s);}catch(e){}};"
        + "try{var of=window.fetch;if(of)window.fetch=function(){var a=arguments;return of.apply(this,a).then(function(r){try{"
        + "var u=(a[0]&&a[0].url)||a[0];r.clone().text().then(function(t){ok(u,t);}).catch(function(){});}catch(e){}return r;});};}catch(e){}"
        + "try{var op=XMLHttpRequest.prototype.open,os=XMLHttpRequest.prototype.send;"
        + "XMLHttpRequest.prototype.open=function(m,u){this.__u=u;return op.apply(this,arguments);};"
        + "XMLHttpRequest.prototype.send=function(){var self=this;this.addEventListener('load',function(){try{ok(self.__u,self.responseText);}catch(e){}});return os.apply(this,arguments);};}catch(e){}"
        + "try{var OW=window.WebSocket;if(OW){var NW=function(url,p){var ws=p!==undefined?new OW(url,p):new OW(url);ws.addEventListener('message',function(ev){try{if(typeof ev.data==='string')ok('ws:'+url,ev.data);}catch(e){}});return ws;};NW.prototype=OW.prototype;NW.CONNECTING=OW.CONNECTING;NW.OPEN=OW.OPEN;NW.CLOSING=OW.CLOSING;NW.CLOSED=OW.CLOSED;window.WebSocket=NW;}}catch(e){}"
        + "try{AndroidBridge.heyoReady();}catch(e){}"
        + "}catch(e){}})();";

    // Read chat names + numbers straight off the rendered page and auto-scroll to load more.
    // Sends only phones not sent before, so it can run every second without flooding.
    static final String SCRAPE =
        "(function(){try{window.__hdvSeen=window.__hdvSeen||{};"
        + "var els=[].slice.call(document.querySelectorAll('*'));"
        + "els.forEach(function(e){try{var st=getComputedStyle(e);if((st.overflowY==='auto'||st.overflowY==='scroll')&&e.scrollHeight>e.clientHeight+40){e.__up=!e.__up;e.scrollTop=e.__up?0:e.scrollHeight;}}catch(x){}});"
        + "var re=/(?:\\+?91[\\s-]*)?[6-9][\\d\\s-]{8,12}\\d/g;var cand={};" // tolerant of 98300 11111 / 98300-11111
        // For each phone keep the shortest on-screen text that mentions it AND carries a name,
        // so we get the chat row (name + number) rather than a whole container or a bare number.
        + "els.forEach(function(e){try{if(e.children.length>8)return;var tx=(e.innerText||e.textContent||'').replace(/\\s+/g,' ').trim();if(!tx||tx.length>200)return;var m=tx.match(re);if(!m)return;"
        + "var hasName=/[A-Za-z\\u00c0-\\uffff]{2}/.test(tx.replace(re,' '));"
        + "m.forEach(function(ph){var d=ph.replace(/\\D/g,'').slice(-10);if(d.length!==10||/^[0-5]/.test(d)||window.__hdvSeen[d])return;"
        + "var score=(hasName?0:100000)+tx.length;var prev=cand[d];if(!prev||score<prev.score)cand[d]={score:score,text:tx};});}catch(x){}});"
        + "var out=[];Object.keys(cand).forEach(function(d){window.__hdvSeen[d]=1;var tx=cand[d].text;"
        + "var name=tx.replace(re,' ').replace(/[•|·:,\\u2013\\u2014-]+/g,' ').replace(/\\s+/g,' ').trim().slice(0,40);out.push({phone:d,name:name,text:tx});});"
        + "if(out.length){try{AndroidBridge.heyoData('dom:scrape',JSON.stringify({conversations:out}));}catch(e){}}"
        + "return out.length;}catch(e){return -1;}})();";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        String url = getIntent().getStringExtra("url");
        if (url == null || url.isEmpty()) url = "https://in.app.myoperator.com/chat";

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(0xFF0A2F55);

        LinearLayout bar = new LinearLayout(this);
        bar.setOrientation(LinearLayout.HORIZONTAL);
        bar.setPadding(24, 18, 24, 18);
        count = new TextView(this);
        count.setTextColor(0xFFFFFFFF);
        count.setText("Connecting to MyOperator…");
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
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, true);
        web.setWebChromeClient(new android.webkit.WebChromeClient());
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
        handler.postDelayed(scraper, 3000);
    }

    // Every ~1.5 s: scroll to load more chats and read the names / numbers on screen.
    private final Runnable scraper = new Runnable() {
        @Override public void run() {
            if (web != null) { try { web.evaluateJavascript(SCRAPE, null); } catch (Exception ignored) {} }
            handler.postDelayed(this, 1500);
        }
    };

    private void updateCount() {
        runOnUiThread(new Runnable() {
            @Override public void run() {
                int n = HeyoStore.pending();
                String head = hookReady ? "Connected ✓" : "Connecting…";
                count.setText(head + (n > 0 ? "  ·  read " + n + " — scroll / open chats, then Done" : "  ·  scroll the chat list to load chats"));
            }
        });
    }

    @Override public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override protected void onDestroy() {
        handler.removeCallbacks(scraper);
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

        @JavascriptInterface
        public void heyoReady() {
            hookReady = true;
            updateCount();
        }
    }
}
