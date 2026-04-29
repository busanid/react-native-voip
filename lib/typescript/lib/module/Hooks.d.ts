export function SipProvider({ children, sipConfigs }: {
    children: any;
    sipConfigs: any;
}): React.FunctionComponentElement<{}>;
export function useSipCore(): {
    callLogs: never[];
    clearCallLogs: () => Promise<any>;
    removeCallLog: (callLogItem: any) => Promise<any>;
};
export function useSipAccount(): {
    agents: never[];
    activeAgent: undefined;
    add: (sipConfig: any) => void;
    remove: (userAgent: any) => void;
    setCurrent: (userAgent: any) => void;
    update: (sipConfig: any) => void;
    registerAll: () => void;
    unRegisterAll: () => void;
};
export function useTargetAgent(id: any): never;
export function useSIPClientStatus(id: any): {
    register?: undefined;
    unRegister?: undefined;
    stop?: undefined;
} | {
    register: () => Promise<any>;
    unRegister: () => Promise<any>;
    stop: () => Promise<any>;
} | undefined;
export function useSipSetting(): {
    boot: () => Promise<void>;
    isEchoCancellationEnabled: boolean | undefined;
    setIsEchoCancellationEnabled: (isEnabled: any) => void;
    isAdaptiveRateControlEnabled: boolean | undefined;
    setIsAdaptiveRateControlEnabled: (isEnabled: any) => void;
    currentDtmfSendType: string | undefined;
    dtmfSendTypes: string[];
    setDtmfType: (dtmfType: any) => void;
    playbackDb: number | undefined;
    setPlaybackDb: (val: any) => Promise<void>;
};
export function useSIPPermission(): {
    checkAudioResult: undefined;
    checkVideoResult: undefined;
    checkPhoneCallResult: undefined;
    openSettings: () => Promise<void>;
    checkOverlayResult: undefined;
    RESULTS: Readonly<{
        readonly UNAVAILABLE: "unavailable";
        readonly BLOCKED: "blocked";
        readonly DENIED: "denied";
        readonly GRANTED: "granted";
        readonly LIMITED: "limited";
    }>;
    requestAll: (callback: any) => Promise<void>;
    requestPhoneCall: () => Promise<void>;
    openAndCheckOverlaySettings: () => Promise<void>;
    openPowerSettings: () => void;
    openNotificationSettings: () => void;
};
export function useAudioDevices(): {
    audioDeviceList: any;
    thirdAudioDevice: any;
    audioDeviceTypeList: any;
    currentInputDevice: any;
    currentOutputDevice: any;
    setAudioDeviceByType: any;
};
export function useAudioDevices_deprecated(): {
    audioDeviceList: never[];
    thirdAudioDevice: null;
    audioDeviceTypeList: never[];
    currentInputDevice: null;
    currentOutputDevice: null;
    setAudioDeviceByType: (type: any) => Promise<void>;
};
export function useSIPClient(id: any): {
    call: (targetUser: any, callOptions: any) => Promise<any>;
    terminate: (session: any) => Promise<void>;
    answer: (session: any, options: any) => Promise<void>;
    transfer: (session: any, transferNumber: any) => Promise<void>;
    sendDTMF: (numStr: any, session: any) => Promise<void>;
    answerAndTerminate: (session: any, options: any) => Promise<void>;
    answerAndHold: (session: any, options: any) => Promise<void>;
    activeSession: null;
    sessions: never[];
    isFailed: boolean;
    cause: string;
    previewVideoViewRef: React.MutableRefObject<null>;
    remoteVideoViewRef: React.MutableRefObject<null>;
    isSpeakerEnabled: boolean;
    isCallSpeakerEnabled: boolean;
    toggleSpeaker: () => Promise<void>;
    toggleCallSpeaker: (callId: any) => Promise<void>;
    isAudioMuted: boolean;
    isVideoMuted: boolean;
    toggleMute: (type: any) => Promise<void>;
    toggleCamera: () => Promise<void>;
    toggleHold: () => Promise<void>;
    isOnHold: {};
    getCallLogs: any;
    toggleRecord: (session: any, recordFilePath: any) => Promise<void>;
};
export function useUnreadCountInfo(agent: any): {
    unreadCountInfo: {
        accounts: never[];
        messageCount: number;
        missedCallsCount: number;
    };
    currentAgentCountInfo: undefined;
};
export function useChat(): {
    chatRooms: never[];
    createChat: (options: any) => Promise<any>;
    deleteChat: (options: any) => Promise<any>;
    reload: () => Promise<void>;
};
export function useChatRoom(chatRoom: any): {
    messages: never[];
    sendMessage: (message: any) => Promise<any>;
    markAsRead: () => Promise<any>;
};
/**
 * Hook for push notification registration.
 *
 * Handles building the SIP contact params string and applying it to a
 * specific SIP account so the server can route incoming calls via push.
 *
 * @example
 * const { registerPushToken, clearPushToken, pushConfig } = usePushNotification('account1');
 *
 * // Call after receiving a FCM/APNs token
 * await registerPushToken({ provider: 'fcm', param: 'mySenderId', prid: fcmToken });
 */
export function usePushNotification(agentId: any): {
    pushConfig: {
        provider: any;
        param: any;
        prid: any;
    } | null;
    registerPushToken: (config: any) => Promise<void>;
    clearPushToken: () => Promise<void>;
};
export { useCallScreening };
export const SipContext: React.Context<{
    agents: never[];
    chatRooms: never[];
    callLogs: never[];
}>;
export const SipDispatchContext: React.Context<null>;
import React from "react";
import { useCallScreening } from "./CallScreening";
//# sourceMappingURL=Hooks.d.ts.map