package expo.modules.webletexit

import android.app.Activity
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class WebletExitModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("WebletExit")

    Function("exitAndRemoveTask") {
      val activity = appContext.currentActivity
      if (activity == null) {
        return@Function false
      }
      activity.runOnUiThread {
        removeFromRecents(activity)
      }
      true
    }
  }

  private fun removeFromRecents(activity: Activity) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      activity.finishAndRemoveTask()
    } else {
      activity.finishAffinity()
    }
  }
}
