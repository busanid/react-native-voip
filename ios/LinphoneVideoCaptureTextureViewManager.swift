//
//  LinphoneVideoCaptureTextureViewManager.swift
//  react-native-linphone-sdk
//
//  Created by cj on 2024/1/4.
//

import Foundation
import linphonesw
import SwiftUICore
import SwiftUI

@objc(LinphoneVideoCaptureTextureViewManager)
class LinphoneVideoCaptureTextureViewManager: RCTViewManager {
  override func view() -> UIView {
    if #available(iOS 13.0, *) {
      return LinphoneVideoCaptureTextureUiView()
    } else {
      return UIView()
    }
  }
  
  @objc override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}

@available(iOS 13.0, *)
class LinphoneVideoCaptureTextureUiView: UIView {
  
  private var hostingController:
      UIHostingController<LinphoneVideoCaptureTextureView>?
  
  @objc var color: NSString? {
    didSet {
      updateSwiftUIView()
    }
  }
  
  @objc var type: NSString? {
    didSet {
      updateSwiftUIView()
    }
  }
  
  override init(frame: CGRect) {
    super.init(frame: frame)
    setup()
  }
  
  required init?(coder: NSCoder) {
    super.init(coder: coder)
    setup()
  }
  
  private func setup() {
    let contentView = LinphoneVideoCaptureTextureView(color: color as String?, type: type as String?)
    let hc = UIHostingController(rootView: contentView)
    hostingController = hc

    hc.view.frame = bounds
    hc.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    hc.view.backgroundColor = .clear
    addSubview(hc.view)
  }
  
  private func updateSwiftUIView(){
    hostingController?.rootView = LinphoneVideoCaptureTextureView(color: color as String?, type: type as String?)
  }
  
}

@available(iOS 13.0, *)
struct LinphoneVideoCaptureTextureView: View {
  
  static var nativeVideoWindow: UIView? = nil
  static var previewVideoWindow: UIView? = nil
  
  let color: String?
  let type: String?
  
  var body:some View {
      LinphoneVideoViewHolder() { view in
        print("IntercomSDK: LinphoneVideoViewHolder returned")
        if(type == "nativeVideo") {
          LinphoneVideoCaptureTextureView.nativeVideoWindow = view
        }
        if(type == "previewVideo") {
          LinphoneVideoCaptureTextureView.previewVideoWindow = view
        }
        
//        LinphoneSdk.shared?.core.nativeVideoWindow = view
      }
  }
}

//@available(iOS 13.0, *)
//class LinphoneVideoCaptureTextureView : UIView {
//    private var videoHolder: LinphoneVideoViewHolder?
//  
//    override init(frame: CGRect) {
//        super.init(frame: frame)
//        setupView()
//    }
//    
//    required init?(coder aDecoder: NSCoder) {
//        super.init(coder: aDecoder)
//        setupView()
//    }
//    
//    private func setupView() {
//      self.backgroundColor = hexStringToUIColor(hexColor: "#ff0000")
//      
//      self.videoHolder =  vvv { videoView in
////        LinphoneSdk.shared?.core.nativeVideoWindow = videoView
//        DispatchQueue.main.async {
//          videoView.backgroundColor = self.hexStringToUIColor(hexColor: "#000000")
//          videoView.frame = self.bounds
//          videoView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
//          self.addSubview(videoView)
//        }
//      }
//    }
//  
//  @objc var color: String = "" {
//    didSet {
//      self.backgroundColor = hexStringToUIColor(hexColor: color)
//    }
//  }
//
//  func hexStringToUIColor(hexColor: String) -> UIColor {
//    let stringScanner = Scanner(string: hexColor)
//
//    if(hexColor.hasPrefix("#")) {
//      stringScanner.scanLocation = 1
//    }
//    var color: UInt32 = 0
//    stringScanner.scanHexInt32(&color)
//
//    let r = CGFloat(Int(color >> 16) & 0x000000FF)
//    let g = CGFloat(Int(color >> 8) & 0x000000FF)
//    let b = CGFloat(Int(color) & 0x000000FF)
//
//    return UIColor(red: r / 255.0, green: g / 255.0, blue: b / 255.0, alpha: 1)
//  }
//}
