package io.github.zhannam85.mymoney;

import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(HomeScreenWidgetPlugin.class);
        super.onCreate(savedInstanceState);

        // #166: edge-to-edge so CSS env(safe-area-inset-*) is real, and
        // the app background shows through the system bars.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);

        handleWidgetTap(getIntent());
    }

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleWidgetTap(intent);
    }

    @Override
    public void onPause() {
        super.onPause();
        MoneyWidgetProvider.updateAllWidgets(this);
    }

    private void handleWidgetTap(Intent intent) {
        if (intent == null || !intent.getBooleanExtra(MoneyWidgetProvider.EXTRA_OPEN_DASHBOARD, false)) {
            return;
        }
        SharedPreferences prefs = getSharedPreferences("CapacitorStorage", MODE_PRIVATE);
        prefs.edit().putString("widgetOpenDashboardRequested", "true").apply();
    }
}
