package com.hindivine.diet;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * Chat data the MyOperator / Heyo panel loads while the user is viewing it inside HeyoActivity.
 * The panel's own JSON responses are collected here and wait in a queue until the web app takes them
 * (through AndroidBridge.heyoTake) and turns the chats into leads. Nothing is stored on disk and no
 * network request is made by the app itself — it only reads what the panel already fetched on screen.
 */
final class HeyoStore {
    private static final int MAX_QUEUE = 300;
    private static final long MAX_CHARS = 30_000_000L;
    private static final List<String[]> queue = new ArrayList<>();
    private static long queueChars;

    private HeyoStore() {}

    static synchronized void add(String url, String body) {
        if (url == null || body == null || body.isEmpty()) return;
        String t = body.trim();
        if (!t.startsWith("{") && !t.startsWith("[")) return; // only JSON
        while (!queue.isEmpty() && (queue.size() >= MAX_QUEUE || queueChars + body.length() > MAX_CHARS)) {
            queueChars -= queue.remove(0)[1].length();
        }
        queue.add(new String[] { url, body });
        queueChars += body.length();
    }

    static synchronized int pending() {
        return queue.size();
    }

    /** JSON [{url, body}] of everything the panel loaded since the last call; clears the queue. */
    static synchronized String take() {
        JSONArray out = new JSONArray();
        try {
            for (String[] q : queue) out.put(new JSONObject().put("url", q[0]).put("body", q[1]));
        } catch (Exception ignored) {
        }
        queue.clear();
        queueChars = 0;
        return out.toString();
    }

    static synchronized void clear() {
        queue.clear();
        queueChars = 0;
    }
}
