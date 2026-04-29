"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.STATE = void 0;
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
const STATE = exports.STATE = LinphoneSdk.CALL_STATE;
var _default = exports.default = {
  STATE
};
//# sourceMappingURL=Call.js.map