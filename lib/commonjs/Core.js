"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _reactNative = require("react-native");
var _events = _interopRequireDefault(require("events"));
var _CallLog = _interopRequireDefault(require("./CallLog"));
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

/** Union of all audio device kinds — use AudioDeviceKind from types.ts for strict typing */

class Core extends _events.default {
  isInit = false;
  constructor() {
    super();
    this.linphoneNativeEventEmitter = new _reactNative.NativeEventEmitter(LinphoneSdk);
    this.triggerRegister();
    this.triggerCallStateChanged();
    this.triggerCalllogUpdated();
    this.triggerAudioDeviceChanged();
    this.triggerChat();
  }
  triggerChat() {
    this.linphoneNativeEventEmitter.addListener('messageReceived', event => {
      this.emit('messageReceived', event);
    });
    this.linphoneNativeEventEmitter.addListener('onChatRoomRead', event => {
      this.emit('onChatRoomRead', event);
    });
    this.linphoneNativeEventEmitter.addListener('onMessageSent', event => {
      this.emit('onMessageSent', event);
    });
    this.linphoneNativeEventEmitter.addListener('onMessageStateChange', event => {
      this.emit('onMessageStateChange', event);
    });
  }
  triggerRegister() {
    this.linphoneNativeEventEmitter.addListener('registered', event => {
      this.triggerRegisterStateChange('registered', event);
    });
    this.linphoneNativeEventEmitter.addListener('unregistered', event => {
      this.triggerRegisterStateChange('unregistered', event);
    });
    this.linphoneNativeEventEmitter.addListener('registrationFailed', event => {
      this.triggerRegisterStateChange('registrationFailed', event);
    });
    this.linphoneNativeEventEmitter.addListener('registrationProgress', event => {
      this.triggerRegisterStateChange('registrationProgress', event);
    });
  }
  triggerRegisterStateChange(state, e) {
    this.emit(state, e);
    this.emit('registerStateChange', e);
  }
  triggerCallStateChanged() {
    this.linphoneNativeEventEmitter.addListener('newRTCSession', event => {
      this.emit('newRTCSession', event);
    });
    this.linphoneNativeEventEmitter.addListener('callStateChanged', event => {
      this.emit('callStateChanged', event);
    });
  }
  triggerAudioDeviceChanged() {
    this.linphoneNativeEventEmitter.addListener('audioDeviceChanged', event => {
      this.emit('audioDeviceChanged', event);
    });
  }
  triggerCalllogUpdated() {
    this.linphoneNativeEventEmitter.addListener('callLogUpdated', event => {
      this.emit('callLogUpdated', event);
    });
  }
  init() {
    if (this.isInit) return false;
    this.isInit = true;
    return LinphoneSdk.initCore();
  }
  start() {
    return LinphoneSdk.start();
  }
  stop() {
    return LinphoneSdk.stop();
  }
  processPushNotification() {
    return LinphoneSdk.processPushNotification();
  }
  toggleCoreSpeaker() {
    return LinphoneSdk.toggleCoreSpeaker();
  }
  toggleCallSpeaker(callId) {
    return LinphoneSdk.toggleCallSpeaker(callId);
  }
  isCallSpeakerEnabled(callId) {
    return LinphoneSdk.isCallSpeakerEnabled(callId);
  }
  isCoreSpeakerEnabled() {
    return LinphoneSdk.isCoreSpeakerEnabled();
  }
  getAudioDevices() {
    return LinphoneSdk.getAudioDevices();
  }
  getCurrentAudioDevices() {
    return LinphoneSdk.getCurrentAudioDevices();
  }
  setAudioDeviceByType(type) {
    return LinphoneSdk.setAudioDeviceByType(type);
  }
  playDTMF(dtmf, duration = 1) {
    return LinphoneSdk.playDTMF(dtmf, duration);
  }
  async getCallLogs(format = true) {
    const callLogs = await LinphoneSdk.getCallLogs();
    if (format) {
      return _CallLog.default.formatLinphone(callLogs);
    }
    return callLogs;
  }
  removeCallLog = async callLogItem => {
    const result = await LinphoneSdk.removeCallLog(callLogItem);
    if (callLogItem !== null && callLogItem !== void 0 && callLogItem.subLog) {
      for (const item of callLogItem.subLog) {
        await LinphoneSdk.removeCallLog(item);
      }
    }
    this.emit('callLogUpdated', {});
    return result;
  };
  setStunServer(domain, port) {
    return LinphoneSdk.setStunServer(`${domain}:${port}`);
  }
  setUserAgent(name, version) {
    return LinphoneSdk.setUserAgent({
      name,
      version
    });
  }
  clearCallLogs = async () => {
    const result = await LinphoneSdk.clearCallLogs();
    this.emit('callLogUpdated', {});
    return result;
  };
  getDefaultAccount() {
    return LinphoneSdk.getDefaultAccount();
  }
  setDefaultAccount(userAgent) {
    const {
      username,
      domain
    } = userAgent;
    return LinphoneSdk.setDefaultAccount({
      username,
      domain
    });
  }
  getIdentity() {
    return LinphoneSdk.getIdentity();
  }
  isEchoCancellationEnabled() {
    return LinphoneSdk.isEchoCancellationEnabled();
  }
  setEchoCancellationEnabled(isEnabled) {
    return LinphoneSdk.setEchoCancellationEnabled(isEnabled);
  }
  isAdaptiveRateControlEnabled() {
    return LinphoneSdk.isAdaptiveRateControlEnabled();
  }
  setAdaptiveRateControlEnabled(isEnabled) {
    return LinphoneSdk.setAdaptiveRateControlEnabled(isEnabled);
  }
  isUseInfoForDtmf() {
    return LinphoneSdk.isUseInfoForDtmf();
  }
  setUseInfoForDtmf(isUse) {
    return LinphoneSdk.setUseInfoForDtmf(isUse);
  }
  isUseRfc2833ForDtmf() {
    return LinphoneSdk.isUseRfc2833ForDtmf();
  }
  setUseRfc2833ForDtmf(isUse) {
    return LinphoneSdk.setUseRfc2833ForDtmf(isUse);
  }
  encryptByPublicKey(publicKey, data) {
    return LinphoneSdk.encryptByPublicKey(publicKey, data);
  }
  decryptByPublicKey(publicKey, data) {
    return LinphoneSdk.decryptByPublicKey(publicKey, data);
  }
  getUnreadCount() {
    return LinphoneSdk.getUnreadCount();
  }
  getPlaybackGainDb() {
    return LinphoneSdk.getPlaybackGainDb();
  }
  setPlaybackGainDb(val) {
    return LinphoneSdk.setPlaybackGainDb(val);
  }
}
var _default = exports.default = new Core();
//# sourceMappingURL=Core.js.map