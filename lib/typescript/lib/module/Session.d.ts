export let LINPHONE_EVENT: {};
export default class Session {
    constructor(event: any);
    isConfirmed: boolean;
    isProgress: boolean;
    isRingRing: boolean;
    isRecording: boolean;
    isOnHoldResult: {
        local: boolean;
        remote: boolean;
    };
    remote_identity: any;
    remote_username: any;
    remote_displayName: any;
    local_address: any;
    local_username: any;
    callId: any;
    isVideo: any;
    originator: any;
    startTime: Date;
    endTime: Date;
    answer(options: any): any;
    terminate: () => any;
    isSpeakerEnabled(): any;
    toggleSpeaker(): any;
    isMuted(): any;
    toggleMute(target: any): any;
    toggleCamera(): any;
    isOnHold(): any;
    toggleHold: () => Promise<any>;
    sendDTMF: (numStr: any) => any;
    startRecording: (recordFilePath: any) => Promise<any>;
    stopRecording: () => Promise<any>;
    transferTo: (targetUri: any) => any;
    getStatus: () => any;
}
//# sourceMappingURL=Session.d.ts.map