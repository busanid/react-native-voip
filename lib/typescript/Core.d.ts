/// <reference types="node" />
import EventEmitter from 'events';
import type { UserAgent } from "react-native-linphone-sdk";
export type callStateChangeEvent = {
    callId: String;
    eventName: String;
};
export type AudioDeviceType = "Earpiece" | "Speaker" | "Bluetooth" | "Headset";
declare class Core extends EventEmitter {
    private linphoneNativeEventEmitter;
    private isInit;
    constructor();
    private triggerChat;
    private triggerRegister;
    private triggerRegisterStateChange;
    private triggerCallStateChanged;
    private triggerAudioDeviceChanged;
    private triggerCalllogUpdated;
    init(): any;
    start(): any;
    stop(): any;
    processPushNotification(): Promise<any>;
    toggleCoreSpeaker(): Promise<any>;
    toggleCallSpeaker(callId: String): Promise<any>;
    isCallSpeakerEnabled(callId: String): Promise<any>;
    isCoreSpeakerEnabled(): Promise<any>;
    getAudioDevices(): Promise<any>;
    getCurrentAudioDevices(): Promise<any>;
    setAudioDeviceByType(type: AudioDeviceType): Promise<any>;
    playDTMF(dtmf: String, duration?: Number): Promise<any>;
    getCallLogs(format?: boolean): Promise<any>;
    removeCallLog: (callLogItem: any) => Promise<any>;
    setStunServer(domain: String, port: String): Promise<any>;
    setUserAgent(name: String, version: String): any;
    clearCallLogs: () => Promise<any>;
    getDefaultAccount(): any;
    setDefaultAccount(userAgent: UserAgent): any;
    getIdentity(): any;
    isEchoCancellationEnabled: () => any;
    setEchoCancellationEnabled: (isEnabled: boolean | undefined) => any;
    isAdaptiveRateControlEnabled: () => any;
    setAdaptiveRateControlEnabled: (isEnabled: boolean | undefined) => any;
    isUseInfoForDtmf(): any;
    setUseInfoForDtmf(isUse: boolean): any;
    isUseRfc2833ForDtmf(): any;
    setUseRfc2833ForDtmf(isUse: boolean): any;
    encryptByPublicKey(publicKey: string, data: string): any;
    decryptByPublicKey(publicKey: string, data: string): any;
    getUnreadCount(): any;
    getPlaybackGainDb(): any;
    setPlaybackGainDb(val: number): any;
}
declare const _default: Core;
export default _default;
//# sourceMappingURL=Core.d.ts.map