import 'react-native-get-random-values';
import EventEmitter from 'events';
import { NativeModules, Platform } from 'react-native';
import Core from './Core';
import type { CallStateChangedEvent } from './Core';
import type { MutedInfo, HoldState } from './types';

const LINKING_ERROR =
  `The package 'react-native-voip' doesn't seem to be linked. Make sure: \n\n` +
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

export enum LINPHONE_EVENT {
  // Outgoing call states
  OutgoingInit = 'OutgoingInit',
  OutgoingProgress = 'OutgoingProgress',
  OutgoingRinging = 'OutgoingRinging',
  OutgoingEarlyMedia = 'OutgoingEarlyMedia',
  // Active call states
  Connected = 'Connected',
  StreamsRunning = 'StreamsRunning',
  // Hold states
  Pausing = 'Pausing',
  Paused = 'Paused',
  PausedByRemote = 'PausedByRemote',
  Resuming = 'Resuming',
  // End states — these are emitted on Session EventEmitter
  End = 'ended',
  Error = 'failed',
  Released = 'released',
  // Misc
  Idle = 'Idle',
  Referred = 'Referred',
  Updating = 'Updating',
  UpdatedByRemote = 'UpdatedByRemote',
}

export default class Session extends EventEmitter {
  public remote_identity: string;
  public remote_username: string;
  public remote_displayName: string;
  public local_address: string;
  public local_username: string;
  public callId: string;
  public isVideo: boolean;
  public isConfirmed: boolean = false;
  public isProgress: boolean = false;
  public isRingRing: boolean = false;
  public originator: 'remote' | 'local';
  public isRecording: boolean = false;
  public isOnHoldResult: HoldState = { local: false, remote: false };
  public startTime: Date | undefined;
  public endTime: Date | undefined;

  constructor(event: any) {
    super();
    const {
      remoteAddress,
      callId,
      remoteUsername,
      isVideo,
      originator,
      remoteDisplayName,
      localAddress,
      localUserName,
    } = event;

    this.remote_identity = remoteAddress;
    this.remote_username = remoteUsername;
    this.remote_displayName = remoteDisplayName;
    this.local_address = localAddress;
    this.local_username = localUserName;
    this.callId = callId;
    this.isVideo = isVideo;
    this.originator = originator;

    const onCallStateChanged = async (e: CallStateChangedEvent) => {
      const { callId: evCallId } = e;
      if (this.callId && this.callId !== evCallId) return;

      const { eventName } = e;

      if (eventName === 'OutgoingProgress') {
        this.callId = e.callId;
        this.isProgress = true;
      }
      if (eventName === 'OutgoingRinging') {
        this.isRingRing = true;
      }
      if (eventName === 'Connected') {
        if (!this.startTime) this.startTime = new Date();
        this.isConfirmed = true;
        this.isProgress = false;
      }
      if (eventName === 'Paused') {
        this.isOnHoldResult.local = true;
      }
      if (eventName === 'PausedByRemote') {
        this.isOnHoldResult.remote = true;
      }
      if (eventName === 'Resuming') {
        this.isOnHoldResult.local = false;
        // remote hold state is controlled independently by PausedByRemote
      }
      if (eventName === 'End') {
        this.endTime = new Date();
        this.emit(LINPHONE_EVENT.End, e);
      }
      if (eventName === 'Error') {
        this.emit(LINPHONE_EVENT.Error, e);
      }
      if (eventName === 'Released') {
        this.emit(LINPHONE_EVENT.Released, e);
        Core.off('callStateChanged', onCallStateChanged);
      }
    };

    Core.on('callStateChanged', onCallStateChanged);
  }

  answer(options: AnswerOptions): Promise<boolean> {
    try {
      options.callId = this.callId;
      return LinphoneSdk.answer(options);
    } catch (err) {
      console.error('Session.answer failed.', err);
      throw new Error('Session.answer failed. ' + JSON.stringify(err));
    }
  }

  terminate = (): Promise<boolean> => {
    return LinphoneSdk.terminate({ linphoneCallId: this.callId });
  };

  isSpeakerEnabled(): Promise<boolean> {
    return LinphoneSdk.isSpeakerEnabled();
  }

  toggleSpeaker(): Promise<boolean> {
    return LinphoneSdk.toggleSpeaker();
  }

  isMuted(): Promise<MutedInfo> {
    return LinphoneSdk.isMuted();
  }

  toggleMute(target: Target): Promise<MutedInfo> {
    const options = { audio: false, video: false };
    options[target] = true;
    return LinphoneSdk.toggleMute(options);
  }

  toggleCamera(): Promise<string> {
    return LinphoneSdk.toggleCamera();
  }

  isOnHold(): Promise<HoldState> {
    return LinphoneSdk.isOnHold({ callId: this.callId });
  }

  toggleHold = async (): Promise<boolean | null> => {
    try {
      if (!this.callId) {
        console.warn('No callId — cannot call toggleHold');
        return null;
      }
      return LinphoneSdk.toggleHold({ callId: this.callId });
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  sendDTMF = (numStr: string): Promise<boolean> => {
    return LinphoneSdk.sendDTMF({ dtmf: numStr, callId: this.callId });
  };

  startRecording = async (recordFilePath: string): Promise<boolean> => {
    const isRecording = await LinphoneSdk.startRecording({
      recordFilePath,
      callId: this.callId,
    });
    this.isRecording = isRecording;
    return isRecording;
  };

  stopRecording = async (): Promise<boolean> => {
    const isRecording = await LinphoneSdk.stopRecording({ callId: this.callId });
    this.isRecording = isRecording;
    return isRecording;
  };

  transferTo = (targetUri: string): Promise<number> => {
    return LinphoneSdk.transferTo({ callId: this.callId, targetUri });
  };

  getStatus = (): Promise<string> => {
    return LinphoneSdk.getStatus({ callId: this.callId });
  };
}
