"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.LINPHONE_EVENT = void 0;
require("react-native-get-random-values");
var _events = _interopRequireDefault(require("events"));
var _reactNative = require("react-native");
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
/*const LINPHONE_EVENT = {
    End: 'ended',
    Error: 'failed',
    Connected: 'confirmed'
};*/
let LINPHONE_EVENT = /*#__PURE__*/function (LINPHONE_EVENT) {
  LINPHONE_EVENT["End"] = "ended";
  LINPHONE_EVENT["Error"] = "failed";
  LINPHONE_EVENT["Connected"] = "confirmed";
  LINPHONE_EVENT["Released"] = "released";
  return LINPHONE_EVENT;
}({});
exports.LINPHONE_EVENT = LINPHONE_EVENT;
class Session extends _events.default {
  //private eventEmitter: NativeEventEmitter;

  isConfirmed = false;
  isProgress = false;
  isRingRing = false;
  isRecording = false;
  isOnHoldResult = {
    local: false,
    remote: false
  };
  //private linphoneCallId: string | undefined;

  constructor(event) {
    super();
    const {
      remoteAddress,
      callId,
      remoteUsername,
      isVideo,
      originator,
      remoteDisplayName,
      localAddress,
      localUserName
    } = event;
    console.debug('session构造函数的event:', event);
    //this.eventEmitter = eventEmitter;
    this.remote_identity = remoteAddress;
    this.remote_username = remoteUsername;
    this.remote_displayName = remoteDisplayName;
    this.local_address = localAddress;
    this.local_username = localUserName;
    this.callId = callId;
    console.warn('创建session时的event:', event);
    this.isVideo = isVideo;
    this.originator = originator;
    console.log('session构造函数的执行', event);
    const onCallStateChanged = async event => {
      const {
        callId
      } = event;
      console.debug('这里检测到的CallId!!!!', callId, 'this.callId', this.callId);
      if (this.callId && this.callId != callId) {
        return;
      }
      const {
        eventName
      } = event;
      if (eventName == 'OutgoingInit') {
        //this.callId = event.callId;
        //this.linphoneCallId = event.callId;
      }
      if (eventName == 'OutgoingProgress') {
        this.callId = event.callId;
        this.isProgress = true;
      }
      if (eventName == 'OutgoingRinging') {
        this.isRingRing = true;
      }
      if (eventName == 'Connected') {
        if (!this.startTime) {
          this.startTime = new Date();
        }
        this.isConfirmed = true;
        this.isProgress = false;
      }
      if (eventName == 'Paused') {
        //TODO这里不能用异步方法.
        //this.isOnHoldResult = await this.isOnHold();
        this.isOnHoldResult.local = true;
      }
      if (eventName == 'PausedByRemote') {
        this.isOnHoldResult.remote = true;
      }
      if (eventName == 'Resuming') {
        this.isOnHoldResult.local = false;
        this.isOnHoldResult.remote = false;
      }
      if (eventName == 'End') {
        this.emit(LINPHONE_EVENT.End, event);
        this.endTime = new Date();
      }
      if (eventName == 'Error') {
        this.emit(LINPHONE_EVENT.Error, event);
      }
      if (eventName == 'Released') {
        this.emit(LINPHONE_EVENT.Released, event);
        //sub.remove();
        _Core.default.off('callStateChanged', onCallStateChanged);
      }
    };
    _Core.default.on('callStateChanged', onCallStateChanged);
    /*const sub = this.eventEmitter.addListener('callStateChanged', event => {
        console.debug('构造函数里的监听session:', event);
        const { eventName } = event;
        if (eventName == 'OutgoingProgress') {
            this.callId = event.callId;
            //this.linphoneCallId = event.callId;
            this.startTime = new Date();
        }
        if (eventName == 'End') {
            this.emit(LINPHONE_EVENT.End, event);
            this.endTime = new Date();
        }
        if (eventName == 'Error') {
            this.emit(LINPHONE_EVENT.Error, event);
        }
        if (eventName == 'Released') {
            this.emit(LINPHONE_EVENT.Released, event);
            sub.remove();
        }
    });*/
  }

  answer(options) {
    try {
      options.callId = this.callId;
      /*const { eventHandlers } = options;
      const answerCallback = (event: callStateChangeEvent) => {
          const { callId } = event;
          if (this.callId != callId) {
              return;
          }
          console.debug('answer后事件回调', event);
          const { eventName } = event;
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
              Core.off('callStateChanged', answerCallback)
          }
      }
      Core.on('callStateChanged', answerCallback);*/
      /*const sub = this.eventEmitter.addListener('callStateChanged', event => {
          console.debug('answer后事件回调', event);
          const { eventName } = event;
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
      return LinphoneSdk.answer(options);
    } catch (err) {
      console.error('调用Session.answer失败.', err);
      throw new Error("调用Session.answer失败." + JSON.stringify(err));
    }
  }
  terminate = () => {
    return LinphoneSdk.terminate({
      linphoneCallId: this.callId
    });
  };
  isSpeakerEnabled() {
    return LinphoneSdk.isSpeakerEnabled();
  }
  toggleSpeaker() {
    return LinphoneSdk.toggleSpeaker();
  }
  isMuted() {
    return LinphoneSdk.isMuted();
  }
  toggleMute(target) {
    let options = {
      audio: false,
      video: false
    };
    options[target] = true;
    //toggle only check target need toggle or not,so hardcode true
    return LinphoneSdk.toggleMute(options);
  }
  /**
   * 切换当前的摄像头，如果有其他摄像头的话
   * @returns 当前的camera名称
   */
  toggleCamera() {
    return LinphoneSdk.toggleCamera();
  }
  isOnHold = () => {
    return LinphoneSdk.isOnHold({
      callId: this.callId
    });
  };
  /**
   * 
   * @returns 本机是否暂停通话
   */
  toggleHold = async () => {
    try {
      if (!this.callId) {
        console.warn('没有callId，不应该调用toggleHold');
        return null;
      }
      let isHold = await LinphoneSdk.toggleHold({
        callId: this.callId
      });
      return isHold;
    } catch (err) {
      console.error(err);
    }
  };
  sendDTMF = async numStr => {
    const options = {
      dtmf: numStr,
      callId: this.callId
    };
    return LinphoneSdk.sendDTMF(options);
  };
  startRecording = async recordFilePath => {
    const isRecording = await LinphoneSdk.startRecording({
      recordFilePath,
      callId: this.callId
    });
    this.isRecording = isRecording;
    return isRecording;
  };
  stopRecording = async () => {
    const isRecording = await LinphoneSdk.stopRecording({
      callId: this.callId
    });
    this.isRecording = isRecording;
    return isRecording;
  };
  transferTo = async targetUri => {
    //0为成功，-1为失败
    const transferResult = await LinphoneSdk.transferTo({
      callId: this.callId,
      targetUri
    });
    return transferResult;
  };
  getStatus = () => {
    return LinphoneSdk.getStatus({
      callId: this.callId
    });
  };
}
exports.default = Session;
//# sourceMappingURL=Session.js.map