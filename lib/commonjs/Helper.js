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
  getDefaultRingtoneUri: () => {
    return LinphoneSdk.getDefaultRingtoneUri();
  },
  refreshRegisters: () => {
    return LinphoneSdk.refreshRegisters();
  },
  makePhoneCall: options => {
    options.type = options.type || "tel";
    return LinphoneSdk.makePhoneCall(options);
  }
};
exports.default = _default;
//# sourceMappingURL=Helper.js.map