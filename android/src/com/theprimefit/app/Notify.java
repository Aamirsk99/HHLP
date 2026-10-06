package com.theprimefit.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

/** Phone notifications for the founder chat (and anything else the page asks to show). */
final class Notify {
    static final String CHANNEL = "founder_chat";

    private Notify() {
    }

    static void show(Context ctx, int id, String title, String body, String open) {
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel ch = new NotificationChannel(CHANNEL, "Founder chat", NotificationManager.IMPORTANCE_HIGH);
            ch.setDescription("New messages in the founder chat");
            ch.enableVibration(true);
            nm.createNotificationChannel(ch);
        }
        Intent i = new Intent(ctx, MainActivity.class);
        i.putExtra("open", open == null ? "" : open);
        i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(ctx, id, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(ctx, CHANNEL) : new Notification.Builder(ctx);
        int icon = ctx.getResources().getIdentifier("ic_notify", "drawable", ctx.getPackageName());
        b.setSmallIcon(icon != 0 ? icon : android.R.drawable.stat_notify_chat)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new Notification.BigTextStyle().bigText(body))
            .setColor(0xFF0B5D57)
            .setCategory(Notification.CATEGORY_MESSAGE)
            .setAutoCancel(true)
            .setContentIntent(pi)
            .setDefaults(Notification.DEFAULT_ALL)
            .setPriority(Notification.PRIORITY_HIGH);
        try {
            nm.notify(id, b.build());
        } catch (SecurityException ignored) {
            // Notifications switched off for the app.
        }
    }
}
