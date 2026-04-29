import { NativeModules, Platform, NativeEventEmitter } from "react-native";
import EventEmitter from 'events';
//import Session from "./Session";
import CallLog from './CallLog';
const LINKING_ERROR = `The package 'react-native-linphone-sdk' doesn't seem to be linked. Make sure: \n\n` + Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ''
}) + '- You rebuilt the app after installing the package\n' + '- You are not using Expo Go\n';
const LinphoneSdk = NativeModules.LinphoneSdk ? NativeModules.LinphoneSdk : new Proxy({}, {
  get() {
    throw new Error(LINKING_ERROR);
  }
});
class Core extends EventEmitter {
  isInit = false;
  //private sessions: Array<Session>;

  constructor() {
    super();
    this.linphoneNativeEventEmitter = new NativeEventEmitter(LinphoneSdk);
    this.triggerRegister();
    this.triggerCallStateChanged();
    this.triggerCalllogUpdated();
    this.triggerAudioDeviceChanged();
    this.triggerChat();
    //this.sessions = [];
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
      /*console.log('core检测到RCT', event);
      let session = new Session(this.linphoneNativeEventEmitter, event);
      event.session = session;
      this.addSession(session);*/
      this.emit('newRTCSession', event);
    });
    this.linphoneNativeEventEmitter.addListener('callStateChanged', event => {
      console.warn('检测到callStateChanged', event);
      this.emit('callStateChanged', event);
    });
  }
  triggerAudioDeviceChanged() {
    //检测不到蓝牙的变化.....
    // this.linphoneNativeEventEmitter.addListener('audioDevicesListUpdated', (event) => {
    //     this.emit('audioDevicesListUpdated', event);
    // });

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
    if (this.isInit) {
      return false;
    }
    this.isInit = true;
    return LinphoneSdk.initCore();
  }
  start() {
    return LinphoneSdk.start();
  }
  stop() {
    return LinphoneSdk.stop();
  }
  async processPushNotification() {
    return LinphoneSdk.processPushNotification();
  }
  async toggleCoreSpeaker() {
    return LinphoneSdk.toggleCoreSpeaker();
  }
  async toggleCallSpeaker(callId) {
    return LinphoneSdk.toggleCallSpeaker(callId);
  }
  async isCallSpeakerEnabled(callId) {
    return LinphoneSdk.isCallSpeakerEnabled(callId);
  }
  async isCoreSpeakerEnabled() {
    return LinphoneSdk.isCoreSpeakerEnabled();
  }
  async getAudioDevices() {
    return LinphoneSdk.getAudioDevices();
  }
  async getCurrentAudioDevices() {
    return LinphoneSdk.getCurrentAudioDevices();
  }
  async setAudioDeviceByType(type) {
    return LinphoneSdk.setAudioDeviceByType(type);
  }
  async playDTMF(dtmf) {
    let duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    return LinphoneSdk.playDTMF(dtmf, duration);
  }
  async getCallLogs() {
    let format = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    let callLogs = await LinphoneSdk.getCallLogs();
    if (format) {
      return CallLog.formatLinphone(callLogs);
    } else {
      return callLogs;
    }
  }
  removeCallLog = async callLogItem => {
    const result = await LinphoneSdk.removeCallLog(callLogItem);
    if (callLogItem !== null && callLogItem !== void 0 && callLogItem.subLog) {
      for (let item of callLogItem.subLog) {
        await LinphoneSdk.removeCallLog(item);
      }
    }
    this.emit("callLogUpdated", {});
    return result;
  };
  async setStunServer(domain, port) {
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
    this.emit("callLogUpdated", {});
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
  isEchoCancellationEnabled = () => {
    return LinphoneSdk.isEchoCancellationEnabled();
  };
  setEchoCancellationEnabled = isEnabled => {
    return LinphoneSdk.setEchoCancellationEnabled(isEnabled);
  };
  isAdaptiveRateControlEnabled = () => {
    return LinphoneSdk.isAdaptiveRateControlEnabled();
  };
  setAdaptiveRateControlEnabled = isEnabled => {
    return LinphoneSdk.setAdaptiveRateControlEnabled(isEnabled);
  };
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

  /*addSession(session: Session) {
      this.sessions.unshift(session);
  }*/
}

export default new Core();

/*export default {
    start
}

function start() {
    LinphoneSdk.start();
}*/
//# sourceMappingURL=Core.js.map