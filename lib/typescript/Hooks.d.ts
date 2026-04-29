import React, { ReactNode } from 'react';
import { UserAgent, Configuration as sipConfig } from './index';
import Session from './Session';
import type { Target, isOnHoldResult } from './Session';
import { PermissionStatus } from 'react-native-permissions';
import type { AudioDeviceType } from './Core';
import { ChatRoom, IMessage } from './Message';
export interface SipContextType {
    agents: UserAgent[];
    chatRooms: ChatRoom[];
    chatRoomDispatch?: Function;
    callLogs: any[];
}
export declare const SipContext: React.Context<SipContextType>;
export interface SipDispatchType {
    type: string;
    sipConfig?: sipConfig;
    username?: string;
    userAgent?: UserAgent;
}
export declare const SipDispatchContext: React.Context<React.Dispatch<SipDispatchType> | null>;
export type SipProviderConfiguration = {
    children: ReactNode;
    sipConfigs: sipConfig[];
};
export declare function SipProvider({ children, sipConfigs }: SipProviderConfiguration): JSX.Element;
export declare function useSipCore(): {
    callLogs: any[];
    clearCallLogs: () => Promise<any>;
    removeCallLog: (callLogItem: any) => Promise<any>;
};
export declare function useSipAccount(): {
    agents: UserAgent[];
    activeAgent: UserAgent | undefined;
    add: (sipConfig: sipConfig) => void;
    remove: (userAgent: UserAgent) => void;
    setCurrent: (userAgent: UserAgent) => void;
    update: (sipConfig: sipConfig) => void;
    registerAll: () => void;
    unRegisterAll: () => void;
};
export declare function useTargetAgent(id: string): UserAgent | undefined;
export type useSIPClientStatusOptions = {
    onRegistered: Function | null;
};
export declare function useSIPClientStatus(id: string): {
    register?: undefined;
    unRegister?: undefined;
    stop?: undefined;
} | {
    register: () => Promise<any>;
    unRegister: () => Promise<any>;
    stop: () => Promise<void | undefined>;
} | undefined;
export declare function useSipSetting(): {
    boot: () => Promise<void>;
    isEchoCancellationEnabled: boolean | undefined;
    setIsEchoCancellationEnabled: (isEnabled: boolean) => void;
    isAdaptiveRateControlEnabled: boolean | undefined;
    setIsAdaptiveRateControlEnabled: (isEnabled: boolean) => void;
    currentDtmfSendType: string | undefined;
    dtmfSendTypes: string[];
    setDtmfType: (dtmfType: string) => void;
    playbackDb: number | undefined;
    setPlaybackDb: (val: number) => Promise<void>;
};
export declare function useSIPPermission(): {
    checkAudioResult: PermissionStatus | undefined;
    checkVideoResult: PermissionStatus | undefined;
    checkPhoneCallResult: PermissionStatus | undefined;
    openSettings: () => Promise<void>;
    checkOverlayResult: PermissionStatus | undefined;
    RESULTS: Readonly<{
        readonly UNAVAILABLE: "unavailable";
        readonly BLOCKED: "blocked";
        readonly DENIED: "denied";
        readonly GRANTED: "granted";
        readonly LIMITED: "limited";
    }>;
    requestAll: (callback?: Function) => Promise<void>;
    requestPhoneCall: () => Promise<void>;
    openAndCheckOverlaySettings: () => Promise<void>;
    openPowerSettings: () => void;
    openNotificationSettings: () => void;
};
export declare function useAudioDevices(): {
    audioDeviceList: [] | null;
    thirdAudioDevice: [] | null;
    audioDeviceTypeList: any[] | null;
    currentInputDevice: object | null;
    currentOutputDevice: object | null;
    setAudioDeviceByType: Function;
};
export declare function useAudioDevices_deprecated(): {
    audioDeviceList: never[];
    thirdAudioDevice: null;
    audioDeviceTypeList: any[];
    currentInputDevice: null;
    currentOutputDevice: null;
    setAudioDeviceByType: (type: AudioDeviceType) => Promise<void>;
};
export declare function useSIPClient(id: string): {
    call: (targetUser: string, callOptions: any) => Promise<any>;
    terminate: (session: Session) => Promise<void>;
    answer: (session: Session, options: any) => Promise<void>;
    transfer: (session: Session, transferNumber: String) => Promise<void>;
    sendDTMF: (numStr: String, session: Session) => Promise<void>;
    answerAndTerminate: (session: Session, options: any) => Promise<void>;
    answerAndHold: (session: Session, options: any) => Promise<void>;
    activeSession: Session | null;
    sessions: Session[];
    isFailed: boolean;
    cause: string;
    previewVideoViewRef: React.MutableRefObject<null>;
    remoteVideoViewRef: React.MutableRefObject<null>;
    isSpeakerEnabled: boolean;
    isCallSpeakerEnabled: boolean;
    toggleSpeaker: () => Promise<void>;
    toggleCallSpeaker: (callId: String) => Promise<void>;
    isAudioMuted: boolean;
    isVideoMuted: boolean;
    toggleMute: (type: Target) => Promise<void>;
    toggleCamera: () => Promise<void>;
    toggleHold: () => Promise<void>;
    isOnHold: isOnHoldResult | null;
    getCallLogs: ((format?: boolean) => Promise<any>) | undefined;
    toggleRecord: (session: Session, recordFilePath: String) => Promise<void>;
};
export interface AccountUnreadCountItem {
    id: string;
    messageCount: number;
    missedCallsCount: number;
}
export interface UnreadCountInfo {
    accounts: AccountUnreadCountItem[];
    messageCount: number;
    missedCallsCount: number;
}
export declare function useUnreadCountInfo(agent: UserAgent): {
    unreadCountInfo: UnreadCountInfo;
    currentAgentCountInfo: AccountUnreadCountItem | undefined;
};
export declare function useChat(): {
    chatRooms: ChatRoom[];
    createChat: (options: {
        targetSipUri: string;
    }) => Promise<any>;
    deleteChat: (options: {
        targetSipUri: string;
    }) => Promise<any>;
    reload: () => Promise<void>;
};
export declare function useChatRoom(chatRoom: ChatRoom): {
    messages: IMessage[];
    sendMessage: (message: string) => Promise<any>;
    markAsRead: () => Promise<any>;
};
/**
 *
 * const { isRegister, onSession } = useUserAgent('5774545');
 *
 * if(isRegister) {
 *     showOline();
 * }
 *
 * onSession((event) => {
 *
 * });
 *
 *
 */ 
//# sourceMappingURL=Hooks.d.ts.map