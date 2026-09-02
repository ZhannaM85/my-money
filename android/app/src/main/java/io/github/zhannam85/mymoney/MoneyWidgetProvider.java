package io.github.zhannam85.mymoney;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.view.View;
import android.widget.RemoteViews;
import org.json.JSONException;
import org.json.JSONObject;

/** #190 — home-screen glance. Reads CapacitorStorage / widgetSnapshot. */
public class MoneyWidgetProvider extends AppWidgetProvider {

    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String SNAPSHOT_KEY = "widgetSnapshot";
    static final String EXTRA_OPEN_DASHBOARD = "openDashboard";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAllWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName provider = new ComponentName(context, MoneyWidgetProvider.class);
        int[] widgetIds = manager.getAppWidgetIds(provider);
        for (int widgetId : widgetIds) {
            updateWidget(context, manager, widgetId);
        }
    }

    private static void updateWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_money_glance);

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String raw = prefs.getString(SNAPSHOT_KEY, null);

        boolean enabled = false;
        String headline = context.getString(R.string.widget_disabled);
        String asOfText = null;

        if (raw != null) {
            try {
                JSONObject snapshot = new JSONObject(raw);
                enabled = snapshot.optBoolean("enabled", false);
                if (enabled) {
                    if (!snapshot.isNull("headline")) {
                        headline = snapshot.getString("headline");
                    }
                    if (!snapshot.isNull("asOfText")) {
                        asOfText = snapshot.getString("asOfText");
                    }
                }
            } catch (JSONException ignored) {
                // Corrupt snapshot — keep the disabled defaults.
            }
        }

        views.setTextViewText(R.id.widget_headline, headline);
        if (asOfText != null) {
            views.setViewVisibility(R.id.widget_as_of, View.VISIBLE);
            views.setTextViewText(R.id.widget_as_of, asOfText);
        } else {
            views.setViewVisibility(R.id.widget_as_of, View.GONE);
        }

        Intent launchIntent = new Intent(context, MainActivity.class);
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        launchIntent.putExtra(EXTRA_OPEN_DASHBOARD, true);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            context,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
