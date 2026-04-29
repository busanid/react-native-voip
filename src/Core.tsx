import { NativeModules, Platform, NativeEventEmitter } from 'react-native';
import EventEmitter from 'events';
import CallLog from './CallLog';
import type {
  AudioDevice,
  AudioDeviceKind,
  CurrentAudioDevices,
  CallLogEntry,
  GroupedCallLog,
} from './types';
import type { UserAgent } from './index';

const LINKING_ERROR =
  `The package 'react-native-voip' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const LinphoneSdk = NativeModules.LinphoneSdk
  ? NativeModules.LinphoneSdk
  : new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    }
  );

export type { AudioDeviceKind };

/** Union of all audio device kinds — use AudioDeviceKind from types.ts for strict typing */
export type AudioDeviceType = AudioDeviceKind;

export interface CallStateChangedEvent {
  callId: string;
  eventName: string;
  remoteAddress?: string;
  displayName?: string;
  remoteUsername?: string;
  localAddress?: string;
  originator?: 'local' | 'remote';
  data?: { cause?: string };
}

export interface RegisterEvent {
  id: string;
  message: string;
  username: string;
  domain: string;
}

class Core extends EventEmitter {
  private linphoneNativeEventEmitter: NativeEventEmitter;
  private isInit = false;

  constructor() {
    super();
    this.linphoneNativeEventEmitter = new NativeEventEmitter(LinphoneSdk);
    this.triggerRegister();
    this.triggerCallStateChanged();
    this.triggerCalllogUpdated();
    this.triggerAudioDeviceChanged();
    this.triggerChat();
  }

  private triggerChat() {
    this.linphoneNativeEventEmitter.addListener('messageReceived', (event) => {
      this.emit('messageReceived', event);
    });
    this.linphoneNativeEventEmitter.addListener('onChatRoomRead', (event) => {
      this.emit('onChatRoomRead', event);
    });
    this.linphoneNativeEventEmitter.addListener('onMessageSent', (event) => {
      this.emit('onMessageSent', event);
    });
    this.linphoneNativeEventEmitter.addListener('onMessageStateChange', (event) => {
      this.emit('onMessageStateChange', event);
    });
  }

  private triggerRegister() {
    this.linphoneNativeEventEmitter.addListener('registered', (event: RegisterEvent) => {
      this.triggerRegisterStateChange('registered', event);
    });
    this.linphoneNativeEventEmitter.addListener('unregistered', (event: RegisterEvent) => {
      this.triggerRegisterStateChange('unregistered', event);
    });
    this.linphoneNativeEventEmitter.addListener('registrationFailed', (event: RegisterEvent) => {
      this.triggerRegisterStateChange('registrationFailed', event);
    });
    this.linphoneNativeEventEmitter.addListener('registrationProgress', (event: RegisterEvent) => {
      this.triggerRegisterStateChange('registrationProgress', event);
    });
  }

  private triggerRegisterStateChange(state: string, e: RegisterEvent) {
    this.emit(state, e);
    this.emit('registerStateChange', e);
  }

  private triggerCallStateChanged() {
    this.linphoneNativeEventEmitter.addListener('newRTCSession', (event) => {
      this.emit('newRTCSession', event);
    });
    this.linphoneNativeEventEmitter.addListener('callStateChanged', (event: CallStateChangedEvent) => {
      this.emit('callStateChanged', event);
    });
  }

  private triggerAudioDeviceChanged() {
    this.linphoneNativeEventEmitter.addListener('audioDeviceChanged', (event) => {
      this.emit('audioDeviceChanged', event);
    });
  }

  private triggerCalllogUpdated() {
    this.linphoneNativeEventEmitter.addListener('callLogUpdated', (event) => {
      this.emit('callLogUpdated', event);
    });
  }

  init(): boolean | Promise<boolean> {
    if (this.isInit) return false;
    this.isInit = true;
    return LinphoneSdk.initCore();
  }

  start(): Promise<boolean> {
    return LinphoneSdk.start();
  }

  stop(): Promise<boolean> {
    return LinphoneSdk.stop();
  }

  processPushNotification(): Promise<boolean> {
    return LinphoneSdk.processPushNotification();
  }

  toggleCoreSpeaker(): Promise<boolean> {
    return LinphoneSdk.toggleCoreSpeaker();
  }

  toggleCallSpeaker(callId: string): Promise<boolean> {
    return LinphoneSdk.toggleCallSpeaker(callId);
  }

  isCallSpeakerEnabled(callId: string): Promise<boolean> {
    return LinphoneSdk.isCallSpeakerEnabled(callId);
  }

  isCoreSpeakerEnabled(): Promise<boolean> {
    return LinphoneSdk.isCoreSpeakerEnabled();
  }

  getAudioDevices(): Promise<AudioDevice[]> {
    return LinphoneSdk.getAudioDevices();
  }

  getCurrentAudioDevices(): Promise<CurrentAudioDevices> {
    return LinphoneSdk.getCurrentAudioDevices();
  }

  setAudioDeviceByType(type: AudioDeviceKind): Promise<boolean> {
    return LinphoneSdk.setAudioDeviceByType(type);
  }

  playDTMF(dtmf: string, duration: number = 1): Promise<boolean> {
    return LinphoneSdk.playDTMF(dtmf, duration);
  }

  async getCallLogs(format = true): Promise<GroupedCallLog[] | CallLogEntry[]> {
    const callLogs = await LinphoneSdk.getCallLogs();
    if (format) {
      return CallLog.formatLinphone(callLogs);
    }
    return callLogs;
  }

  removeCallLog = async (callLogItem: GroupedCallLog): Promise<boolean> => {
    const result = await LinphoneSdk.removeCallLog(callLogItem);
    if (callLogItem?.subLog) {
      for (const item of callLogItem.subLog) {
        await LinphoneSdk.removeCallLog(item);
      }
    }
    this.emit('callLogUpdated', {});
    return result;
  };

  setStunServer(domain: string, port: string): Promise<boolean> {
    return LinphoneSdk.setStunServer(`${domain}:${port}`);
  }

  setUserAgent(name: string, version: string): Promise<boolean> {
    return LinphoneSdk.setUserAgent({ name, version });
  }

  clearCallLogs = async (): Promise<boolean> => {
    const result = await LinphoneSdk.clearCallLogs();
    this.emit('callLogUpdated', {});
    return result;
  };

  getDefaultAccount(): Promise<{ username: string; domain: string } | null> {
    return LinphoneSdk.getDefaultAccount();
  }

  setDefaultAccount(userAgent: UserAgent): Promise<boolean> {
    const { username, domain } = userAgent;
    return LinphoneSdk.setDefaultAccount({ username, domain });
  }

  getIdentity(): Promise<string> {
    return LinphoneSdk.getIdentity();
  }

  isEchoCancellationEnabled(): Promise<boolean> {
    return LinphoneSdk.isEchoCancellationEnabled();
  }

  setEchoCancellationEnabled(isEnabled: boolean): Promise<boolean> {
    return LinphoneSdk.setEchoCancellationEnabled(isEnabled);
  }

  isAdaptiveRateControlEnabled(): Promise<boolean> {
    return LinphoneSdk.isAdaptiveRateControlEnabled();
  }

  setAdaptiveRateControlEnabled(isEnabled: boolean): Promise<boolean> {
    return LinphoneSdk.setAdaptiveRateControlEnabled(isEnabled);
  }

  isUseInfoForDtmf(): Promise<boolean> {
    return LinphoneSdk.isUseInfoForDtmf();
  }

  setUseInfoForDtmf(isUse: boolean): Promise<boolean> {
    return LinphoneSdk.setUseInfoForDtmf(isUse);
  }

  isUseRfc2833ForDtmf(): Promise<boolean> {
    return LinphoneSdk.isUseRfc2833ForDtmf();
  }

  setUseRfc2833ForDtmf(isUse: boolean): Promise<boolean> {
    return LinphoneSdk.setUseRfc2833ForDtmf(isUse);
  }

  encryptByPublicKey(publicKey: string, data: string): Promise<string> {
    return LinphoneSdk.encryptByPublicKey(publicKey, data);
  }

  decryptByPublicKey(publicKey: string, data: string): Promise<string> {
    return LinphoneSdk.decryptByPublicKey(publicKey, data);
  }

  getUnreadCount(): Promise<any> {
    return LinphoneSdk.getUnreadCount();
  }

  getPlaybackGainDb(): Promise<number> {
    return LinphoneSdk.getPlaybackGainDb();
  }

  setPlaybackGainDb(val: number): Promise<boolean> {
    return LinphoneSdk.setPlaybackGainDb(val);
  }
}

export default new Core();
