import EventEmitter from 'events';
import type { AudioDevice, AudioDeviceKind, CurrentAudioDevices, CallLogEntry, GroupedCallLog } from './types';
import type { UserAgent } from './index';
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
    data?: {
        cause?: string;
    };
}
export interface RegisterEvent {
    id: string;
    message: string;
    username: string;
    domain: string;
}
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
    init(): boolean | Promise<boolean>;
    start(): Promise<boolean>;
    stop(): Promise<boolean>;
    processPushNotification(): Promise<boolean>;
    toggleCoreSpeaker(): Promise<boolean>;
    toggleCallSpeaker(callId: string): Promise<boolean>;
    isCallSpeakerEnabled(callId: string): Promise<boolean>;
    isCoreSpeakerEnabled(): Promise<boolean>;
    getAudioDevices(): Promise<AudioDevice[]>;
    getCurrentAudioDevices(): Promise<CurrentAudioDevices>;
    setAudioDeviceByType(type: AudioDeviceKind): Promise<boolean>;
    playDTMF(dtmf: string, duration?: number): Promise<boolean>;
    getCallLogs(format?: boolean): Promise<GroupedCallLog[] | CallLogEntry[]>;
    removeCallLog: (callLogItem: GroupedCallLog) => Promise<boolean>;
    setStunServer(domain: string, port: string): Promise<boolean>;
    setUserAgent(name: string, version: string): Promise<boolean>;
    clearCallLogs: () => Promise<boolean>;
    getDefaultAccount(): Promise<{
        username: string;
        domain: string;
    } | null>;
    setDefaultAccount(userAgent: UserAgent): Promise<boolean>;
    getIdentity(): Promise<string>;
    isEchoCancellationEnabled(): Promise<boolean>;
    setEchoCancellationEnabled(isEnabled: boolean): Promise<boolean>;
    isAdaptiveRateControlEnabled(): Promise<boolean>;
    setAdaptiveRateControlEnabled(isEnabled: boolean): Promise<boolean>;
    isUseInfoForDtmf(): Promise<boolean>;
    setUseInfoForDtmf(isUse: boolean): Promise<boolean>;
    isUseRfc2833ForDtmf(): Promise<boolean>;
    setUseRfc2833ForDtmf(isUse: boolean): Promise<boolean>;
    encryptByPublicKey(publicKey: string, data: string): Promise<string>;
    decryptByPublicKey(publicKey: string, data: string): Promise<string>;
    getUnreadCount(): Promise<any>;
    getPlaybackGainDb(): Promise<number>;
    setPlaybackGainDb(val: number): Promise<boolean>;
}
declare const _default: Core;
export default _default;
//# sourceMappingURL=Core.d.ts.map