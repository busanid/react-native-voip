import 'react-native-get-random-values';
import EventEmitter from 'events';
import type { MutedInfo, HoldState } from './types';
export type { MutedInfo };
export type { HoldState as isOnHoldResult };
export type AnswerOptions = {
    mediaConstraints: {
        audio: boolean;
        video: boolean;
    };
    previewVideoViewId?: number | null;
    remoteVideoViewId?: number | null;
    callId?: string | null;
    recordFilePath?: string;
};
export type TerminateOptions = {
    linphoneCallId: string;
};
export type Target = 'audio' | 'video';
export declare enum LINPHONE_EVENT {
    OutgoingInit = "OutgoingInit",
    OutgoingProgress = "OutgoingProgress",
    OutgoingRinging = "OutgoingRinging",
    OutgoingEarlyMedia = "OutgoingEarlyMedia",
    Connected = "Connected",
    StreamsRunning = "StreamsRunning",
    Pausing = "Pausing",
    Paused = "paused",
    PausedByRemote = "PausedByRemote",
    Resuming = "Resuming",
    End = "ended",
    Error = "failed",
    Released = "released",
    Idle = "Idle",
    Referred = "Referred",
    Updating = "Updating",
    UpdatedByRemote = "UpdatedByRemote"
}
export default class Session extends EventEmitter {
    remote_identity: string;
    remote_username: string;
    remote_displayName: string;
    local_address: string;
    local_username: string;
    callId: string;
    isVideo: boolean;
    isConfirmed: boolean;
    isProgress: boolean;
    isRingRing: boolean;
    originator: 'remote' | 'local';
    isRecording: boolean;
    isOnHoldResult: HoldState;
    startTime: Date | undefined;
    endTime: Date | undefined;
    constructor(event: any);
    answer(options: AnswerOptions): Promise<boolean>;
    terminate: () => Promise<boolean>;
    isSpeakerEnabled(): Promise<boolean>;
    toggleSpeaker(): Promise<boolean>;
    isMuted(): Promise<MutedInfo>;
    toggleMute(target: Target): Promise<MutedInfo>;
    toggleCamera(): Promise<string>;
    isOnHold(): Promise<HoldState>;
    toggleHold: () => Promise<boolean | null>;
    sendDTMF: (numStr: string) => Promise<boolean>;
    startRecording: (recordFilePath: string) => Promise<boolean>;
    stopRecording: () => Promise<boolean>;
    transferTo: (targetUri: string) => Promise<number>;
    getStatus: () => Promise<string>;
}
//# sourceMappingURL=Session.d.ts.map