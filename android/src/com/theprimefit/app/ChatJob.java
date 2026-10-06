package com.theprimefit.app;

import android.app.job.JobInfo;
import android.app.job.JobParameters;
import android.app.job.JobScheduler;
import android.app.job.JobService;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

import java.net.URLEncoder;

/**
 * Checks the Google Sheet for new founder chat messages about every 15 minutes while the app is
 * closed, and shows a notification. The signed-in founder's login id, the sheet link and the last
 * message already seen are kept in private app storage by the page (Bridge.chatWatch).
 */
public class ChatJob extends JobService {
    static final int JOB = 7101;
    static final String PREFS = "chat_watch";

    static void schedule(Context ctx) {
        JobScheduler js = (JobScheduler) ctx.getSystemService(Context.JOB_SCHEDULER_SERVICE);
        if (js == null) return;
        for (JobInfo j : js.getAllPendingJobs()) if (j.getId() == JOB) return;
        JobInfo info = new JobInfo.Builder(JOB, new ComponentName(ctx, ChatJob.class))
            .setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY)
            .setPeriodic(15 * 60 * 1000L)
            .setPersisted(true)
            .build();
        try {
            js.schedule(info);
        } catch (Exception ignored) {
        }
    }

    static void cancel(Context ctx) {
        JobScheduler js = (JobScheduler) ctx.getSystemService(Context.JOB_SCHEDULER_SERVICE);
        if (js != null) js.cancel(JOB);
    }

    @Override
    public boolean onStartJob(final JobParameters params) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    check(ChatJob.this);
                } catch (Exception ignored) {
                }
                jobFinished(params, false);
            }
        }).start();
        return true;
    }

    @Override
    public boolean onStopJob(JobParameters params) {
        return true;
    }

    static void check(Context ctx) throws Exception {
        SharedPreferences p = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String url = p.getString("url", "");
        String secret = p.getString("secret", "");
        String me = p.getString("me", "");
        long seen = p.getLong("seen", 0);
        if (url.isEmpty() || me.isEmpty()) return;
        String sep = url.contains("?") ? "&" : "?";
        String key = URLEncoder.encode(secret, "UTF-8");
        Net.Reply r = Net.fetch("GET", url + sep + "action=chat&since=" + seen + "&secret=" + key, null);
        if (r.status != 200) return;
        JSONObject o = new JSONObject(r.text);
        JSONArray chat = o.optJSONArray("chat");
        if (chat == null) {
            // Google Sheet script older than version 11: read the whole data and pick out the chat.
            r = Net.fetch("GET", url + sep + "action=load&secret=" + key, null);
            if (r.status != 200) return;
            JSONObject st = new JSONObject(r.text).optJSONObject("state");
            chat = st == null ? null : st.optJSONArray("chat");
        }
        if (chat == null) return;
        long max = seen;
        int n = 0;
        String from = "";
        String text = "";
        for (int i = 0; i < chat.length(); i++) {
            JSONObject m = chat.optJSONObject(i);
            if (m == null) continue;
            long at = m.optLong("at");
            if (at <= seen) continue;
            if (at > max) max = at;
            if (me.equals(m.optString("byId"))) continue;
            n++;
            from = m.optString("by", "Founder");
            text = m.optString("text", "");
        }
        if (n > 0) {
            String title = n == 1 ? from + " · Founder chat" : n + " new messages · Founder chat";
            Notify.show(ctx, 1, title, n == 1 ? text : from + ": " + text, "chat");
        }
        if (max > seen) p.edit().putLong("seen", max).apply();
    }
}
