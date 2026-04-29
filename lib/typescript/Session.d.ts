/// <reference types="node" />
import 'react-native-get-random-values';
import EventEmitter from 'events';
export type AnswerOptions = {
    eventHandlers: {
        confirmed: Function;
        ended: Function;
        failed: Function;
        released: Function;
    };
    mediaConstraints: {
        audio: boolean;
        video: boolean;
    };
    previewVideoViewId: number | null;
    remoteVideoViewId: number | null;
    callId: String | null;
};
export type TerminateOptions = {
    linphoneCallId: string;
};
export declare enum LINPHONE_EVENT {
    End = "ended",
    Error = "failed",
    Connected = "confirmed",
    Released = "released"
}
export type mutedInfo = {
    audio: boolean;
    video: boolean;
};
export type Target = 'audio' | 'video';
export type isOnHoldResult = {
    local?: boolean;
    remote?: boolean;
};
export default class Session extends EventEmitter {
    remote_identity: String;
    remote_username: String;
    remote_displayName: String;
    local_address: String;
    local_username: String;
    callId: String;
    isVideo: boolean;
    isConfirmed: boolean;
    isProgress: boolean;
    isRingRing: boolean;
    originator: "remote" | "local";
    isRecording: boolean;
    isOnHoldResult: isOnHoldResult;
    startTime: Date | undefined;
    endTime: Date | undefined;
    constructor(event: any);
    answer(options: any): any;
    terminate: () => any;
    isSpeakerEnabled(): any;
    toggleSpeaker(): any;
    isMuted(): any;
    toggleMute(target: Target): mutedInfo;
    /**
     * 切换当前的摄像头，如果有其他摄像头的话
     * @returns 当前的camera名称
     */
    toggleCamera(): string;
    isOnHold: () => Promise<isOnHoldResult>;
    /**
     *
     * @returns 本机是否暂停通话
     */
    toggleHold: () => Promise<any>;
    sendDTMF: (numStr: String) => Promise<any>;
    startRecording: (recordFilePath: String) => Promise<any>;
    stopRecording: () => Promise<any>;
    transferTo: (targetUri: String) => Promise<any>;
    getStatus: () => any;
}
//# sourceMappingURL=Session.d.ts.map