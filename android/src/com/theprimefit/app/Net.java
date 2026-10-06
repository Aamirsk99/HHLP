package com.theprimefit.app;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/** One HTTP request that follows Apps Script's redirects (POST, then GET the answer). */
final class Net {
    static final class Reply {
        int status;
        String text;
    }

    private Net() {
    }

    static Reply fetch(String method, String address, String body) {
        Reply r = new Reply();
        try {
            String url = address;
            boolean post = "POST".equals(method);
            HttpURLConnection c = null;
            for (int hop = 0; hop < 6; hop++) {
                c = (HttpURLConnection) new URL(url).openConnection();
                c.setInstanceFollowRedirects(false);
                c.setConnectTimeout(20000);
                c.setReadTimeout(60000);
                if (post) {
                    c.setRequestMethod("POST");
                    c.setDoOutput(true);
                    c.setRequestProperty("Content-Type", "text/plain;charset=utf-8");
                    try (OutputStream o = c.getOutputStream()) { o.write(body == null ? new byte[0] : body.getBytes(StandardCharsets.UTF_8)); }
                }
                r.status = c.getResponseCode();
                if (r.status < 300 || r.status > 399) break;
                String next = c.getHeaderField("Location");
                c.disconnect();
                if (next == null) break;
                url = new URL(new URL(url), next).toString();
                post = false;
            }
            InputStream in = r.status >= 400 ? c.getErrorStream() : c.getInputStream();
            ByteArrayOutputStream buf = new ByteArrayOutputStream();
            if (in != null) {
                byte[] b = new byte[16384];
                for (int n; (n = in.read(b)) > 0; ) buf.write(b, 0, n);
                in.close();
            }
            c.disconnect();
            r.text = new String(buf.toByteArray(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            r.status = -1;
            r.text = String.valueOf(e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage());
        }
        return r;
    }
}
