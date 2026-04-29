"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _reactNative = require("react-native");
const LINKING_ERROR = `The package 'react-native-linphone-sdk' doesn't seem to be linked. Make sure: \n\n` + _reactNative.Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ''
}) + '- You rebuilt the app after installing the package\n' + '- You are not using Expo Go\n';
const LinphoneSdk = _reactNative.NativeModules.LinphoneSdk ? _reactNative.NativeModules.LinphoneSdk : new Proxy({}, {
  get() {
    throw new Error(LINKING_ERROR);
  }
});
var _default = {
  openOverlaySettings: () => {
    return LinphoneSdk.openOverlaySettings();
  },
  openPowerSettings: () => {
    return LinphoneSdk.openPowerSettings();
  },
  isIgnoringBatteryOptimizations: () => {
    return LinphoneSdk.isIgnoringBatteryOptimizations();
  },
  openNotificationSettings: () => {
    return LinphoneSdk.openNotificationSettings();
  },
  checkOverlayPermission: () => {
    return LinphoneSdk.checkOverlayPermission();
  },
  enterBackground: () => {
    if (_reactNative.Platform.OS == "android") {
      return LinphoneSdk.enterBackground();
    } else {
      console.log('enterBackground只支持android');
    }
  },
  enterForeground: () => {
    if (_reactNative.Platform.OS == "android") {
      return LinphoneSdk.enterForeground();
    } else {
      console.log("enterForeground只支持android");
    }
  }
};
exports.default = _default;
//# sourceMappingURL=Permissions.js.map