export const __esModule: boolean;
export const useCallScreening: typeof _CallScreening.useCallScreening;
export const SipContext: any;
export const SipDispatchContext: any;
export function SipProvider({ children, sipConfigs }: {
    children: any;
    sipConfigs: any;
}): any;
export function useAudioDevices(): {
    audioDeviceList: any;
    thirdAudioDevice: any;
    audioDeviceTypeList: any;
    currentInputDevice: any;
    currentOutputDevice: any;
    setAudioDeviceByType: any;
};
export function useAudioDevices_deprecated(): {
    audioDeviceList: any;
    thirdAudioDevice: any;
    audioDeviceTypeList: any;
    currentInputDevice: any;
    currentOutputDevice: any;
    setAudioDeviceByType: (type: any) => Promise<void>;
};
import _CallScreening = require("./CallScreening");
export function useChat(): {
    chatRooms: any;
    createChat: (options: any) => Promise<any>;
    deleteChat: (options: any) => Promise<any>;
    reload: () => Promise<void>;
};
export function useChatRoom(chatRoom: any): {
    messages: any;
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
    pushConfig: any;
    registerPushToken: any;
    clearPushToken: any;
};
export function useSIPClient(id: any): {
    call: (targetUser: any, callOptions: any) => Promise<any>;
    terminate: (session: any) => Promise<void>;
    answer: (session: any, options: any) => Promise<void>;
    transfer: (session: any, transferNumber: any) => Promise<void>;
    sendDTMF: (numStr: any, session: any) => Promise<void>;
    answerAndTerminate: (session: any, options: any) => Promise<void>;
    answerAndHold: (session: any, options: any) => Promise<void>;
    activeSession: any;
    sessions: any;
    isFailed: any;
    cause: any;
    previewVideoViewRef: any;
    remoteVideoViewRef: any;
    isSpeakerEnabled: any;
    isCallSpeakerEnabled: any;
    toggleSpeaker: () => Promise<void>;
    toggleCallSpeaker: (callId: any) => Promise<void>;
    isAudioMuted: any;
    isVideoMuted: any;
    toggleMute: (type: any) => Promise<void>;
    toggleCamera: () => Promise<void>;
    toggleHold: () => Promise<void>;
    isOnHold: any;
    getCallLogs: any;
    toggleRecord: (session: any, recordFilePath: any) => Promise<void>;
};
export function useSIPClientStatus(id: any): {
    register?: undefined;
    unRegister?: undefined;
    stop?: undefined;
} | {
    register: () => Promise<any>;
    unRegister: () => Promise<any>;
    stop: () => Promise<any>;
} | undefined;
export function useSIPPermission(): {
    checkAudioResult: any;
    checkVideoResult: any;
    checkPhoneCallResult: any;
    openSettings: () => Promise<void>;
    checkOverlayResult: any;
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
export function useSipAccount(): {
    agents: any;
    activeAgent: any;
    add: (sipConfig: any) => void;
    remove: (userAgent: any) => void;
    setCurrent: (userAgent: any) => void;
    update: (sipConfig: any) => void;
    registerAll: () => void;
    unRegisterAll: () => void;
};
export function useSipCore(): {
    callLogs: any;
    clearCallLogs: any;
    removeCallLog: any;
};
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
export function useTargetAgent(id: any): any;
export function useUnreadCountInfo(agent: any): {
    unreadCountInfo: any;
    currentAgentCountInfo: any;
};
//# sourceMappingURL=Hooks.d.ts.map