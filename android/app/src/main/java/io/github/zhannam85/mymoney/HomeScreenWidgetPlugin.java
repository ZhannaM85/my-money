package io.github.zhannam85.mymoney;

import android.content.ComponentName;
import android.content.pm.PackageManager;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** #190 — hide the glance provider until Settings turns the widget on. */
@CapacitorPlugin(name = "HomeScreenWidget")
public class HomeScreenWidgetPlugin extends Plugin {

    @PluginMethod
    public void setEnabled(PluginCall call) {
        boolean enabled = Boolean.TRUE.equals(call.getBoolean("enabled", false));
        PackageManager pm = getContext().getPackageManager();
        ComponentName component = new ComponentName(getContext(), MoneyWidgetProvider.class);
        pm.setComponentEnabledSetting(
            component,
            enabled
                ? PackageManager.COMPONENT_ENABLED_STATE_ENABLED
                : PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
            PackageManager.DONT_KILL_APP
        );
        if (enabled) {
            MoneyWidgetProvider.updateAllWidgets(getContext());
        }
        call.resolve();
    }
}
