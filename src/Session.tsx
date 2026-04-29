import 'react-native-get-random-values';
import EventEmitter from 'events';
import { NativeModules, Platform } from 'react-native';
import Core, { callStateChangeEvent } from './Core';
const LINKING_ERROR =
    `The package 'react-native-linphone-sdk' doesn't seem to be linked. Make sure: \n\n` +
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
export type AnswerOptions = {
    eventHandlers: {
        confirmed: Function,
        ended: Function,
        failed: Function,
        released: Function
    },
    mediaConstraints: {
        audio: boolean,
        video: boolean
    },
    previewVideoViewId: number | null,
    remoteVideoViewId: number | null,
    callId: String | null
}

export type TerminateOptions = {
    linphoneCallId: string
}

/*const LINPHONE_EVENT = {
    End: 'ended',
    Error: 'failed',
    Connected: 'confirmed'
};*/
export enum LINPHONE_EVENT {
    End = 'ended',
    Error = 'failed',
    Connected = 'confirmed',
    Released = 'released'
}

export type mutedInfo = {
    audio: boolean,
    video: boolean
}

export type Target = 'audio' | 'video';
export type isOnHoldResult = {
    local?: boolean,
    remote?: boolean
}

export default class Session extends EventEmitter {
    //private eventEmitter: NativeEventEmitter;
    public remote_identity: String;
    public remote_username: String;
    public remote_displayName: String;
    public local_address: String;
    public local_username: String;
    public callId: String;
    public isVideo: boolean;
    public isConfirmed: boolean = false;
    public isProgress: boolean = false;
    public isRingRing: boolean = false;
    public originator: "remote" | "local";
    public isRecording: boolean = false;
    public isOnHoldResult: isOnHoldResult = { local: false, remote: false };
    //private linphoneCallId: string | undefined;
    public startTime: Date | undefined;
    public endTime: Date | undefined;
    constructor(event: any) {
        super();
        const { remoteAddress, callId, remoteUsername, isVideo, originator, remoteDisplayName, localAddress, localUserName } = event;
        console.debug('session构造函数的event:', event);
        //this.eventEmitter = eventEmitter;
        this.remote_identity = remoteAddress;
        this.remote_username = remoteUsername;
        this.remote_displayName = remoteDisplayName;
        this.local_address = localAddress;
        this.local_username = localUserName;
        this.callId = callId;
        console.warn('创建session时的event:', event);
        this.isVideo = isVideo;
        this.originator = originator;

        console.log('session构造函数的执行', event);
        const onCallStateChanged = async (event: callStateChangeEvent) => {
            const { callId } = event;
            console.debug('这里检测到的CallId!!!!', callId, 'this.callId', this.callId);
            if (this.callId && this.callId != callId) {
                return;
            }

            const { eventName } = event;
            if (eventName == 'OutgoingInit') {
                //this.callId = event.callId;
                //this.linphoneCallId = event.callId;
            }
            if (eventName == 'OutgoingProgress') {
                this.callId = event.callId;
                this.isProgress = true;
            }
            if(eventName == 'OutgoingRinging') {
                this.isRingRing = true;
            }
            if (eventName == 'Connected') {
                if (!this.startTime) {
                    this.startTime = new Date();
                }
                this.isConfirmed = true;
                this.isProgress = false;
            }
            if (eventName == 'Paused') {
                //TODO这里不能用异步方法.
                //this.isOnHoldResult = await this.isOnHold();
                this.isOnHoldResult.local = true;
            }
            if (eventName == 'PausedByRemote') {
                this.isOnHoldResult.remote = true;
            }
            if (eventName == 'Resuming') {
                this.isOnHoldResult.local = false;
                this.isOnHoldResult.remote = false;
            }
            if (eventName == 'End') {
                this.emit(LINPHONE_EVENT.End, event);
                this.endTime = new Date();
            }
            if (eventName == 'Error') {
                this.emit(LINPHONE_EVENT.Error, event);
            }
            if (eventName == 'Released') {
                this.emit(LINPHONE_EVENT.Released, event);
                //sub.remove();
                Core.off('callStateChanged', onCallStateChanged);
            }
        }
        Core.on('callStateChanged', onCallStateChanged);
        /*const sub = this.eventEmitter.addListener('callStateChanged', event => {
            console.debug('构造函数里的监听session:', event);
            const { eventName } = event;
            if (eventName == 'OutgoingProgress') {
                this.callId = event.callId;
                //this.linphoneCallId = event.callId;
                this.startTime = new Date();
            }
            if (eventName == 'End') {
                this.emit(LINPHONE_EVENT.End, event);
                this.endTime = new Date();
            }
            if (eventName == 'Error') {
                this.emit(LINPHONE_EVENT.Error, event);
            }
            if (eventName == 'Released') {
                this.emit(LINPHONE_EVENT.Released, event);
                sub.remove();
            }
        });*/
    }
    answer(options: any) {
        try {
            options.callId = this.callId;
            /*const { eventHandlers } = options;
            const answerCallback = (event: callStateChangeEvent) => {
                const { callId } = event;
                if (this.callId != callId) {
                    return;
                }
                console.debug('answer后事件回调', event);
                const { eventName } = event;
                if (eventName == 'Connected') {
                    eventHandlers.confirmed(event);
                }
                if (eventName == 'Error') {
                    eventHandlers.failed(event);
                }
                if (eventName == 'End') {
                    eventHandlers.ended(event);
                }
                if (eventName == 'Released') {
                    eventHandlers.released(event);
                    Core.off('callStateChanged', answerCallback)
                }
            }
            Core.on('callStateChanged', answerCallback);*/
            /*const sub = this.eventEmitter.addListener('callStateChanged', event => {
                console.debug('answer后事件回调', event);
                const { eventName } = event;
                if (eventName == 'Connected') {
                    eventHandlers.confirmed(event);
                }
                if (eventName == 'Error') {
                    eventHandlers.failed(event);
                }
                if (eventName == 'End') {
                    eventHandlers.ended(event);
                }
                if (eventName == 'Released') {
                    eventHandlers.released(event);
                    sub.remove();
                }
            });*/
            return LinphoneSdk.answer(options);
        } catch (err) {
            console.error('调用Session.answer失败.', err);
            throw new Error("调用Session.answer失败." + JSON.stringify(err))
        }
    }
    terminate = () => {
        return LinphoneSdk.terminate({
            linphoneCallId: this.callId
        });
    }
    isSpeakerEnabled() {
        return LinphoneSdk.isSpeakerEnabled();
    }
    toggleSpeaker() {
        return LinphoneSdk.toggleSpeaker();
    }
    isMuted() {
        return LinphoneSdk.isMuted();
    }
    toggleMute(target: Target): mutedInfo {
        let options = {
            audio: false,
            video: false
        };
        options[target] = true;
        //toggle only check target need toggle or not,so hardcode true
        return LinphoneSdk.toggleMute(options);
    }
    /**
     * 切换当前的摄像头，如果有其他摄像头的话
     * @returns 当前的camera名称
     */
    toggleCamera(): string {
        return LinphoneSdk.toggleCamera();
    }
    isOnHold = (): Promise<isOnHoldResult> => {
        return LinphoneSdk.isOnHold({
            callId: this.callId
        });
    }
    /**
     * 
     * @returns 本机是否暂停通话
     */
    toggleHold = async () => {
        try {
            if (!this.callId) {
                console.warn('没有callId，不应该调用toggleHold');
                return null;
            }
            let isHold = await LinphoneSdk.toggleHold({
                callId: this.callId
            });
            return isHold;
        } catch (err) {
            console.error(err);
        }
    }

    sendDTMF = async (numStr: String) => {
        const options = {
            dtmf: numStr,
            callId: this.callId
        };
        return LinphoneSdk.sendDTMF(options);
    }

    startRecording = async (recordFilePath: String) => {
        const isRecording = await LinphoneSdk.startRecording({
            recordFilePath,
            callId: this.callId
        })
        this.isRecording = isRecording;
        return isRecording;
    }

    stopRecording = async () => {
        const isRecording = await LinphoneSdk.stopRecording({
            callId: this.callId
        });
        this.isRecording = isRecording;
        return isRecording;
    }

    transferTo = async (targetUri: String) => {
        //0为成功，-1为失败
        const transferResult = await LinphoneSdk.transferTo({
            callId: this.callId,
            targetUri,
        });
        return transferResult;
    }

    getStatus = () => {
        return LinphoneSdk.getStatus({
            callId: this.callId
        })
    }
}
