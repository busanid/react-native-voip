package com.linphonesdk

import android.content.Context
import android.graphics.Color
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.TextView
import com.facebook.react.views.view.ReactViewGroup
import org.linphone.mediastream.*
import org.linphone.mediastream.video.capture.CaptureTextureView

class LinphoneVideoCaptureTextureView(context: Context): CaptureTextureView(context) {
  init {
    // set padding and background color
    //setPadding(16,16,16,16)
    //setBackgroundColor(Color.parseColor("#5FD3F3"))

    // add default text view
    /*addView(TextView(context).apply {
      text = "Welcome to Android Fragments with React Native."
    })
    val captureTextureView = CaptureTextureView(context)
    addView(captureTextureView)*/
  }

  override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
    super.onLayout(changed, left, top, right, bottom)
  }

  override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    super.onMeasure(widthMeasureSpec, heightMeasureSpec)
  }
}
