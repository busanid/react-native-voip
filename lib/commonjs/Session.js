"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.LINPHONE_EVENT = void 0;
require("react-native-get-random-values");
var _events = _interopRequireDefault(require("events"));
var _reactNative = require("react-native");
var _Core = _interopRequireDefault(require("./Core"));
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
let LINPHONE_EVENT = exports.LINPHONE_EVENT = /*#__PURE__*/function (LINPHONE_EVENT) {
  // Outgoing call states
  LINPHONE_EVENT["OutgoingInit"] = "OutgoingInit";
  LINPHONE_EVENT["OutgoingProgress"] = "OutgoingProgress";
  LINPHONE_EVENT["OutgoingRinging"] = "OutgoingRinging";
  LINPHONE_EVENT["OutgoingEarlyMedia"] = "OutgoingEarlyMedia";
  // Active call states
  LINPHONE_EVENT["Connected"] = "Connected";
  LINPHONE_EVENT["StreamsRunning"] = "StreamsRunning";
  // Hold states
  LINPHONE_EVENT["Pausing"] = "Pausing";
  LINPHONE_EVENT["Paused"] = "paused";
  LINPHONE_EVENT["PausedByRemote"] = "PausedByRemote";
  LINPHONE_EVENT["Resuming"] = "Resuming";
  // End states — these are emitted on Session EventEmitter
  LINPHONE_EVENT["End"] = "ended";
  LINPHONE_EVENT["Error"] = "failed";
  LINPHONE_EVENT["Released"] = "released";
  // Misc
  LINPHONE_EVENT["Idle"] = "Idle";
  LINPHONE_EVENT["Referred"] = "Referred";
  LINPHONE_EVENT["Updating"] = "Updating";
  LINPHONE_EVENT["UpdatedByRemote"] = "UpdatedByRemote";
  return LINPHONE_EVENT;
}({});
class Session extends _events.default {
  isConfirmed = false;
  isProgress = false;
  isRingRing = false;
  isRecording = false;
  isOnHoldResult = {
    local: false,
    remote: false
  };
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
    this.remote_identity = remoteAddress;
    this.remote_username = remoteUsername;
    this.remote_displayName = remoteDisplayName;
    this.local_address = localAddress;
    this.local_username = localUserName;
    this.callId = callId;
    this.isVideo = isVideo;
    this.originator = originator;
    const onCallStateChanged = async e => {
      const {
        callId: evCallId
      } = e;
      if (this.callId && this.callId !== evCallId) return;
      const {
        eventName
      } = e;
      if (eventName === 'OutgoingProgress') {
        this.callId = e.callId;
        this.isProgress = true;
      }
      if (eventName === 'OutgoingRinging') {
        this.isRingRing = true;
      }
      if (eventName === 'Connected') {
        if (!this.startTime) this.startTime = new Date();
        this.isConfirmed = true;
        this.isProgress = false;
      }
      if (eventName === 'Paused') {
        this.isOnHoldResult.local = true;
      }
      if (eventName === 'PausedByRemote') {
        this.isOnHoldResult.remote = true;
      }
      if (eventName === 'Resuming') {
        this.isOnHoldResult.local = false;
        this.isOnHoldResult.remote = false;
      }
      if (eventName === 'End') {
        this.endTime = new Date();
        this.emit(LINPHONE_EVENT.End, e);
      }
      if (eventName === 'Error') {
        this.emit(LINPHONE_EVENT.Error, e);
      }
      if (eventName === 'Released') {
        this.emit(LINPHONE_EVENT.Released, e);
        _Core.default.off('callStateChanged', onCallStateChanged);
      }
    };
    _Core.default.on('callStateChanged', onCallStateChanged);
  }
  answer(options) {
    try {
      options.callId = this.callId;
      return LinphoneSdk.answer(options);
    } catch (err) {
      console.error('Session.answer failed.', err);
      throw new Error('Session.answer failed. ' + JSON.stringify(err));
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
    const options = {
      audio: false,
      video: false
    };
    options[target] = true;
    return LinphoneSdk.toggleMute(options);
  }
  toggleCamera() {
    return LinphoneSdk.toggleCamera();
  }
  isOnHold() {
    return LinphoneSdk.isOnHold({
      callId: this.callId
    });
  }
  toggleHold = async () => {
    try {
      if (!this.callId) {
        console.warn('No callId — cannot call toggleHold');
        return null;
      }
      return LinphoneSdk.toggleHold({
        callId: this.callId
      });
    } catch (err) {
      console.error(err);
      return null;
    }
  };
  sendDTMF = numStr => {
    return LinphoneSdk.sendDTMF({
      dtmf: numStr,
      callId: this.callId
    });
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
  transferTo = targetUri => {
    return LinphoneSdk.transferTo({
      callId: this.callId,
      targetUri
    });
  };
  getStatus = () => {
    return LinphoneSdk.getStatus({
      callId: this.callId
    });
  };
}
exports.default = Session;
//# sourceMappingURL=Session.js.map