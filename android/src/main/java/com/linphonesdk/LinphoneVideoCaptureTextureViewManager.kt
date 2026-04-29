package com.linphonesdk

import android.graphics.Color
import android.view.View
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.views.image.ReactImageView
import org.linphone.mediastream.video.capture.CaptureTextureView

class LinphoneVideoCaptureTextureViewManager(reactContext: ReactApplicationContext) : SimpleViewManager<LinphoneVideoCaptureTextureView>() {
  override fun getName(): String {
    return "LinphoneVideoCaptureTextureView"
  }

  override fun createViewInstance(context: ThemedReactContext): LinphoneVideoCaptureTextureView {
    val instance = LinphoneVideoCaptureTextureView(context)
//    instance.rotateToMatchDisplayOrientation(0)
    return instance
  }

  @ReactProp(name = "isVisible")
  fun setIsVisible(view: LinphoneVideoCaptureTextureView, isVisible: Boolean?) {
    if(isVisible == true) {
      view.visibility = View.VISIBLE
    } else {
      view.visibility = View.INVISIBLE
    }
  }

}
