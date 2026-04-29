declare const _default: Core;
export default _default;
/** Union of all audio device kinds — use AudioDeviceKind from types.ts for strict typing */
declare class Core {
    isInit: boolean;
    linphoneNativeEventEmitter: NativeEventEmitter;
    triggerChat(): void;
    triggerRegister(): void;
    triggerRegisterStateChange(state: any, e: any): void;
    triggerCallStateChanged(): void;
    triggerAudioDeviceChanged(): void;
    triggerCalllogUpdated(): void;
    init(): any;
    start(): any;
    stop(): any;
    processPushNotification(): any;
    toggleCoreSpeaker(): any;
    toggleCallSpeaker(callId: any): any;
    isCallSpeakerEnabled(callId: any): any;
    isCoreSpeakerEnabled(): any;
    getAudioDevices(): any;
    getCurrentAudioDevices(): any;
    setAudioDeviceByType(type: any): any;
    playDTMF(dtmf: any, duration?: number): any;
    getCallLogs(format?: boolean): Promise<any>;
    removeCallLog: (callLogItem: any) => Promise<any>;
    setStunServer(domain: any, port: any): any;
    setUserAgent(name: any, version: any): any;
    clearCallLogs: () => Promise<any>;
    getDefaultAccount(): any;
    setDefaultAccount(userAgent: any): any;
    getIdentity(): any;
    isEchoCancellationEnabled(): any;
    setEchoCancellationEnabled(isEnabled: any): any;
    isAdaptiveRateControlEnabled(): any;
    setAdaptiveRateControlEnabled(isEnabled: any): any;
    isUseInfoForDtmf(): any;
    setUseInfoForDtmf(isUse: any): any;
    isUseRfc2833ForDtmf(): any;
    setUseRfc2833ForDtmf(isUse: any): any;
    encryptByPublicKey(publicKey: any, data: any): any;
    decryptByPublicKey(publicKey: any, data: any): any;
    getUnreadCount(): any;
    getPlaybackGainDb(): any;
    setPlaybackGainDb(val: any): any;
}
import { NativeEventEmitter } from "react-native/Libraries/EventEmitter/NativeEventEmitter";
//# sourceMappingURL=Core.d.ts.map