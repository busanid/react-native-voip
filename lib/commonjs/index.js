"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  Constants: true,
  multiply: true,
  UserAgent: true,
  PreviewVideoView: true,
  RemoteVideoView: true,
  LINPHONE_EVENT: true,
  SipProvider: true,
  useSIPClient: true,
  useSIPClientStatus: true,
  useSIPPermission: true,
  SipContext: true,
  useTargetAgent: true,
  useSipAccount: true,
  useSipCore: true,
  useSipSetting: true,
  useAudioDevices: true,
  useChat: true,
  useChatRoom: true,
  useUnreadCountInfo: true,
  usePushNotification: true,
  useCallScreening: true,
  Helper: true,
  Call: true,
  Core: true
};
Object.defineProperty(exports, "Call", {
  enumerable: true,
  get: function () {
    return _Call.default;
  }
});
exports.Constants = void 0;
Object.defineProperty(exports, "Core", {
  enumerable: true,
  get: function () {
    return _Core.default;
  }
});
Object.defineProperty(exports, "Helper", {
  enumerable: true,
  get: function () {
    return _Helper.default;
  }
});
Object.defineProperty(exports, "LINPHONE_EVENT", {
  enumerable: true,
  get: function () {
    return _Session.LINPHONE_EVENT;
  }
});
exports.RemoteVideoView = exports.PreviewVideoView = void 0;
Object.defineProperty(exports, "SipContext", {
  enumerable: true,
  get: function () {
    return _Hooks.SipContext;
  }
});
Object.defineProperty(exports, "SipProvider", {
  enumerable: true,
  get: function () {
    return _Hooks.SipProvider;
  }
});
exports.UserAgent = void 0;
exports.multiply = multiply;
Object.defineProperty(exports, "useAudioDevices", {
  enumerable: true,
  get: function () {
    return _Hooks.useAudioDevices;
  }
});
Object.defineProperty(exports, "useCallScreening", {
  enumerable: true,
  get: function () {
    return _Hooks.useCallScreening;
  }
});
Object.defineProperty(exports, "useChat", {
  enumerable: true,
  get: function () {
    return _Hooks.useChat;
  }
});
Object.defineProperty(exports, "useChatRoom", {
  enumerable: true,
  get: function () {
    return _Hooks.useChatRoom;
  }
});
Object.defineProperty(exports, "usePushNotification", {
  enumerable: true,
  get: function () {
    return _Hooks.usePushNotification;
  }
});
Object.defineProperty(exports, "useSIPClient", {
  enumerable: true,
  get: function () {
    return _Hooks.useSIPClient;
  }
});
Object.defineProperty(exports, "useSIPClientStatus", {
  enumerable: true,
  get: function () {
    return _Hooks.useSIPClientStatus;
  }
});
Object.defineProperty(exports, "useSIPPermission", {
  enumerable: true,
  get: function () {
    return _Hooks.useSIPPermission;
  }
});
Object.defineProperty(exports, "useSipAccount", {
  enumerable: true,
  get: function () {
    return _Hooks.useSipAccount;
  }
});
Object.defineProperty(exports, "useSipCore", {
  enumerable: true,
  get: function () {
    return _Hooks.useSipCore;
  }
});
Object.defineProperty(exports, "useSipSetting", {
  enumerable: true,
  get: function () {
    return _Hooks.useSipSetting;
  }
});
Object.defineProperty(exports, "useTargetAgent", {
  enumerable: true,
  get: function () {
    return _Hooks.useTargetAgent;
  }
});
Object.defineProperty(exports, "useUnreadCountInfo", {
  enumerable: true,
  get: function () {
    return _Hooks.useUnreadCountInfo;
  }
});
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
var _Session = require("./Session");
var _LinphoneVideoCaptureTextureView = require("./LinphoneVideoCaptureTextureView");
var _events = _interopRequireDefault(require("events"));
var _Hooks = require("./Hooks");
var _CallLog = _interopRequireDefault(require("./CallLog"));
var _Helper = _interopRequireDefault(require("./Helper"));
var _Call = _interopRequireDefault(require("./Call"));
var _Core = _interopRequireDefault(require("./Core"));
var _types = require("./types");
Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _types[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _types[key];
    }
  });
});
var _PushNotification = require("./PushNotification");
Object.keys(_PushNotification).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _PushNotification[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _PushNotification[key];
    }
  });
});
var _CallScreening = require("./CallScreening");
Object.keys(_CallScreening).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _CallScreening[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _CallScreening[key];
    }
  });
});
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const LINKING_ERROR = `The package 'react-native-voip' doesn't seem to be linked. Make sure: \n\n` + _reactNative.Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ''
}) + '- You rebuilt the app after installing the package\n' + '- You are not using Expo Go\n';
const LinphoneSdk = _reactNative.NativeModules.LinphoneSdk ? _reactNative.NativeModules.LinphoneSdk : new Proxy({}, {
  get() {
    throw new Error(LINKING_ERROR);
  }
});
const Constants = exports.Constants = LinphoneSdk.getConstants();
/** @deprecated use Core methods directly */
function multiply(a, b) {
  return LinphoneSdk.multiply(a, b);
}
class UserAgent extends _events.default {
  constructor(configuration) {
    super();
    configuration.isDefault = configuration.isDefault || false;
    this.configuration = configuration;
    this.isRegistered = false;
    this.isProgress = false;
    this.error = '';
    this.id = configuration.id;
    this.username = configuration.username;
    this.password = configuration.password;
    this.domain = configuration.domain;
    this.displayName = configuration.displayName;
    this.remark = configuration.remark;
    this.proxyDomain = configuration.proxyDomain;
    this.transportType = configuration.transportType;
    this.stunDomain = configuration.stunDomain;
    this.stunPort = configuration.stunPort;
    this.stunEnabled = configuration.stunEnabled;
    this.isDefault = configuration.isDefault;
    this.sessions = [];
    LinphoneSdk.userAgentInit(configuration);
  }
  getUsername() {
    return this.username;
  }
  getConfiguration() {
    return {
      ...this.configuration,
      isDefault: this.isDefault
    };
  }
  setIsDefault(isDefault) {
    this.isDefault = isDefault;
    if (isDefault) {
      _Core.default.setDefaultAccount(this);
    }
    return isDefault;
  }
  async stop() {
    try {
      await this.unregister();
      this.terminateSessions();
      await LinphoneSdk.stop();
    } catch (err) {
      console.error('Failed to stop UserAgent.', err);
    }
  }
  register() {
    return LinphoneSdk.registerIt(this.configuration);
  }
  unregister() {
    this.isRegistered = false;
    return LinphoneSdk.unregister(this.configuration);
  }
  async getCallLogs(format = true) {
    const callLogs = await LinphoneSdk.getCallLogs();
    if (format) {
      return _CallLog.default.formatLinphone(callLogs);
    }
    return callLogs;
  }
  async clearCallLogs() {
    return LinphoneSdk.clearCallLogs();
  }
  addSession(session) {
    this.sessions.unshift(session);
  }
  async terminateSessions(targetSession) {
    if (!this.sessions || !Array.isArray(this.sessions)) return;
    for (let i = 0; i < this.sessions.length; i++) {
      try {
        const session = this.sessions[i];
        if (targetSession) {
          if (targetSession.callId === (session === null || session === void 0 ? void 0 : session.callId)) {
            await (session === null || session === void 0 ? void 0 : session.terminate());
            this.sessions.splice(i, 1);
          }
        } else {
          await (session === null || session === void 0 ? void 0 : session.terminate());
          this.sessions.splice(i, 1);
        }
      } catch (error) {
        console.error(`Failed to terminate session: ${error}`);
      }
    }
  }
  async getSession(callId) {
    for (const session of this.sessions) {
      if (session.callId === callId) return session;
    }
    return false;
  }
  async call(target, options) {
    try {
      return await LinphoneSdk.call(target, options);
    } catch (e) {
      console.error('Call failed.', e);
    }
  }
  async updateAccount(newSipConfig) {
    const prevSipConfig = {
      username: this.username,
      password: this.password,
      domain: this.domain
    };
    return LinphoneSdk.updateAccount({
      prevSipConfig,
      newSipConfig
    });
  }
  async remove() {
    const prevSipConfig = {
      id: this.id,
      username: this.username,
      password: this.password,
      domain: this.domain
    };
    return LinphoneSdk.remove(prevSipConfig);
  }
  async setContactUriParameters(contactUriParameters) {
    return LinphoneSdk.setContactUriParameters({
      id: this.id,
      contactUriParameters
    });
  }
  getContactUriParameters() {
    return LinphoneSdk.getContactUriParameters({
      id: this.id
    });
  }
  async setContactParameters(contactParameters) {
    return LinphoneSdk.setContactParameters({
      id: this.id,
      contactParameters
    });
  }
  getContactParameters() {
    return LinphoneSdk.getContactParameters({
      id: this.id
    });
  }
}
exports.UserAgent = UserAgent;
class PreviewVideoView extends _react.default.Component {
  render() {
    return /*#__PURE__*/_react.default.createElement(_LinphoneVideoCaptureTextureView.LinphoneVideoCaptureTextureView, this.props);
  }
}
exports.PreviewVideoView = PreviewVideoView;
class RemoteVideoView extends _react.default.Component {
  render() {
    return /*#__PURE__*/_react.default.createElement(_LinphoneVideoCaptureTextureView.LinphoneVideoCaptureTextureView, this.props);
  }
}
exports.RemoteVideoView = RemoteVideoView;
//# sourceMappingURL=index.js.map