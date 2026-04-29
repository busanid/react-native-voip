"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const LINKING_ERROR = `The package 'react-native-linphone-sdk' doesn't seem to be linked. Make sure: \n\n` + _reactNative.Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ''
}) + '- You rebuilt the app after installing the package\n' + '- You are not using Expo Go\n';
const LinphoneSdk = _reactNative.NativeModules.LinphoneSdk ? _reactNative.NativeModules.LinphoneSdk : new Proxy({}, {
  get() {
    throw new Error(LINKING_ERROR);
  }
});
const Constants = LinphoneSdk.getConstants();
exports.Constants = Constants;
function multiply(a, b) {
  return LinphoneSdk.multiply(a, b);
}
class UserAgent extends _events.default {
  //private eventEmitter: NativeEventEmitter;

  constructor(configuration) {
    super();
    configuration.isDefault = configuration.isDefault || false;
    this.configuration = configuration;
    //this.eventEmitter = new NativeEventEmitter(LinphoneSdk);
    //LinphoneSdk.UserAgent(configuration);
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

    // Core.on('newRTCSession', (event) => {
    //   const { localAddress } = event;
    //   /*console.debug('Useragent event:', event);
    //   if(!localAddress || !localAddress.match(`${this.username}@${this.domain}`)) {
    //     return;
    //   }*/
    //   console.debug(`UserAgent 成功监听到newRTCSession事件`, event);
    //   let session = new Session(this.eventEmitter, event);
    //   this.addSession(session);

    //   event.session = session;
    //   this.emit('newRTCSession', event);
    // });
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
    //this.configuration.isDefault = isDefault
    this.isDefault = isDefault;
    if (isDefault) {
      _Core.default.setDefaultAccount(this);
    }
    return isDefault;
  }

  /*start() {
    return LinphoneSdk.start();
  }*/

  async stop() {
    try {
      await this.unregister();
      this.terminateSessions();
      await LinphoneSdk.stop();
    } catch (err) {
      console.error('停止useragent失败.', err);
    }
  }
  register() {
    console.log('this.configuration', this.configuration);
    return LinphoneSdk.registerIt(this.configuration);
  }

  //TODO: 多账户这里需要修改
  unregister() {
    this.isRegistered = false;
    return LinphoneSdk.unregister(this.configuration);
  }
  async getCallLogs() {
    let format = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    let callLogs = await LinphoneSdk.getCallLogs();
    if (format) {
      return _CallLog.default.formatLinphone(callLogs);
    } else {
      return callLogs;
    }
  }
  async clearCallLogs() {
    return await LinphoneSdk.clearCallLogs();
  }

  /*on(eventName: string, callback: (event: registerEvent) => void) {
    const sub = this.eventEmitter.addListener(eventName, (event) => {
      console.debug(`成功监听到${eventName}事件`, event);
      if (eventName == 'newRTCSession') {
        let session = new Session(this.eventEmitter, event);
        event.session = session;
        this.addSession(session);
      }
      callback(event);
    });
    return sub;
  }*/

  addSession(session) {
    this.sessions.unshift(session);
  }
  async terminateSessions(targetSession) {
    if (!this.sessions || !Array.isArray(this.sessions)) {
      console.error('sessions is not an array');
      return;
    }
    for (let i = 0; i < this.sessions.length; i++) {
      try {
        const session = this.sessions[i];
        if (targetSession) {
          if (targetSession.callId == (session === null || session === void 0 ? void 0 : session.callId)) {
            await (session === null || session === void 0 ? void 0 : session.terminate());
            this.sessions.splice(i, 1);
          }
        } else {
          await (session === null || session === void 0 ? void 0 : session.terminate());
          this.sessions.splice(i, 1);
        }
      } catch (error) {
        console.error(`结束所有sessions中的某个session失败，${error}`);
      }
    }
  }
  async getSession(callId) {
    for (let session of this.sessions) {
      if (session.callId == callId) {
        return session;
      }
    }
    return false;
  }
  async call(target, options) {
    try {
      /*const { eventHandlers } = options;
      const sub = this.eventEmitter.addListener('callStateChanged', event => {
        console.debug('UserAgent的callStateChanged', event);
        const { eventName } = event;
        if (eventName == 'OutgoingInit') {
          eventHandlers.progress(event);
        }
        if (eventName == 'Connected') {
          eventHandlers.confirmed(event);
        }
        if (eventName == 'Error') {
          eventHandlers.failed(event);
        }
        if (eventName == 'End') {
          eventHandlers.ended(event);
        }
        if (eventName == 'Released') {
          eventHandlers.released(event);
          sub.remove();
        }
      });*/
      return await LinphoneSdk.call(target, options);
    } catch (e) {
      console.error('呼叫失败.', e);
    }
  }
  async updateAccount(newSipConfig) {
    let prevSipConfig = {
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
    let prevSipConfig = {
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
      /*username: this.username,
      domain: this.domain,*/
      contactUriParameters
    });
  }
  getContactUriParameters() {
    return LinphoneSdk.getContactUriParameters({
      id: this.id
      /*username: this.username,
      domain: this.domain*/
    });
  }

  async setContactParameters(contactParameters) {
    return LinphoneSdk.setContactParameters({
      id: this.id,
      /*username: this.username,
      domain: this.domain,*/
      contactParameters
    });
  }
  getContactParameters() {
    return LinphoneSdk.getContactParameters({
      id: this.id
      /*username: this.username,
      domain: this.domain*/
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