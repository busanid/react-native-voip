import React from 'react';
import { NativeModules, Platform } from 'react-native';
import type { CallOptions } from './types';
import Session, { LINPHONE_EVENT } from './Session';
export { LINPHONE_EVENT };
import { LinphoneVideoCaptureTextureView } from './LinphoneVideoCaptureTextureView';
import EventEmitter from 'events';

import {
  SipProvider,
  useSIPClient,
  useSIPClientStatus,
  useSIPPermission,
  SipContext,
  useTargetAgent,
  useSipAccount,
  useSipCore,
  useSipSetting,
  useAudioDevices,
  useChat,
  useChatRoom,
  useUnreadCountInfo,
  usePushNotification,
  useCallScreening,
} from './Hooks';
import CallLog from './CallLog';

export {
  SipProvider,
  useSIPClient,
  useSIPClientStatus,
  useSIPPermission,
  SipContext,
  useTargetAgent,
  useSipAccount,
  useSipCore,
  useSipSetting,
  useAudioDevices,
  useChat,
  useChatRoom,
  useUnreadCountInfo,
  usePushNotification,
  useCallScreening,
};

import Helper from './Helper';
export { Helper };

import Call from './Call';
export { Call };

import Core from './Core';
export { Core };

export * from './types';
export * from './PushNotification';
export * from './CallScreening';

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

const Constants = LinphoneSdk.getConstants();
export { Constants };

/** @deprecated use Core methods directly */
export function multiply(a: number, b: number): Promise<number> {
  return LinphoneSdk.multiply(a, b);
}

export interface Configuration {
  id: string;
  username: string;
  password: string;
  domain: string;
  displayName: string;
  remark: string;
  isDefault: boolean;
  proxyDomain: string;
  /** 'UDP' | 'TCP' | 'TLS' */
  transportType: string;
  stunDomain: string;
  stunPort: string;
  stunEnabled: boolean;
  /** SIP contact URI params for push notification: pn-provider;pn-param;pn-prid */
  contactParams: string;
}

export interface RegisterEvent {
  originator: string;
  message: string;
  session: Session;
}

export class UserAgent extends EventEmitter {
  private configuration: Configuration;
  public isRegistered: boolean;
  public isProgress: boolean;
  public error: string;

  public id: string;
  public username: string;
  public password: string;
  public domain: string;
  public displayName: string;
  public remark: string;
  public proxyDomain: string;
  public transportType: string;
  public stunDomain: string;
  public stunPort: string;
  public stunEnabled: boolean;
  public isDefault: boolean;

  private sessions: Session[];

  constructor(configuration: Configuration) {
    super();
    configuration.isDefault = configuration.isDefault || false;

    this.configuration = configuration;
    this.isRegistered = false;
    this.isProgress = false;
    this.error = '';

    this.id = configuration.id;
    this.username = configuration.username;
    this.password = configuration.password;
    this.domain = configuration.domain;
    this.displayName = configuration.displayName;
    this.remark = configuration.remark;
    this.proxyDomain = configuration.proxyDomain;
    this.transportType = configuration.transportType;
    this.stunDomain = configuration.stunDomain;
    this.stunPort = configuration.stunPort;
    this.stunEnabled = configuration.stunEnabled;
    this.isDefault = configuration.isDefault;

    this.sessions = [];

    LinphoneSdk.userAgentInit(configuration);
  }

  getUsername(): string {
    return this.username;
  }

  getConfiguration(): Configuration {
    return { ...this.configuration, isDefault: this.isDefault };
  }

  setIsDefault(isDefault: boolean): boolean {
    this.isDefault = isDefault;
    if (isDefault) {
      Core.setDefaultAccount(this);
    }
    return isDefault;
  }

  async stop(): Promise<void> {
    try {
      await this.unregister();
      this.terminateSessions();
      await LinphoneSdk.stop();
    } catch (err) {
      console.error('Failed to stop UserAgent.', err);
    }
  }

  register(): Promise<boolean> {
    return LinphoneSdk.registerIt(this.configuration);
  }

  unregister(): Promise<boolean> {
    this.isRegistered = false;
    return LinphoneSdk.unregister(this.configuration);
  }

  async getCallLogs(format = true): Promise<any[]> {
    const callLogs = await LinphoneSdk.getCallLogs();
    if (format) {
      return CallLog.formatLinphone(callLogs);
    }
    return callLogs;
  }

  async clearCallLogs(): Promise<boolean> {
    return LinphoneSdk.clearCallLogs();
  }

  addSession(session: Session): void {
    this.sessions.unshift(session);
  }

  async terminateSessions(targetSession?: Session): Promise<void> {
    if (!this.sessions || !Array.isArray(this.sessions)) return;
    for (let i = 0; i < this.sessions.length; i++) {
      try {
        const session = this.sessions[i];
        if (targetSession) {
          if (targetSession.callId === session?.callId) {
            await session?.terminate();
            this.sessions.splice(i, 1);
          }
        } else {
          await session?.terminate();
          this.sessions.splice(i, 1);
        }
      } catch (error) {
        console.error(`Failed to terminate session: ${error}`);
      }
    }
  }

  async getSession(callId: string): Promise<Session | false> {
    for (const session of this.sessions) {
      if (session.callId === callId) return session;
    }
    return false;
  }

  async call(target: string, options: CallOptions): Promise<string | undefined> {
    try {
      return await LinphoneSdk.call(target, options);
    } catch (e) {
      console.error('Call failed.', e);
    }
  }

  async updateAccount(newSipConfig: Configuration): Promise<boolean> {
    const prevSipConfig = {
      username: this.username,
      password: this.password,
      domain: this.domain,
    };
    return LinphoneSdk.updateAccount({ prevSipConfig, newSipConfig });
  }

  async remove(): Promise<boolean> {
    const prevSipConfig = {
      id: this.id,
      username: this.username,
      password: this.password,
      domain: this.domain,
    };
    return LinphoneSdk.remove(prevSipConfig);
  }

  async setContactUriParameters(contactUriParameters: string): Promise<boolean> {
    return LinphoneSdk.setContactUriParameters({ id: this.id, contactUriParameters });
  }

  getContactUriParameters(): Promise<string> {
    return LinphoneSdk.getContactUriParameters({ id: this.id });
  }

  async setContactParameters(contactParameters: string): Promise<boolean> {
    return LinphoneSdk.setContactParameters({ id: this.id, contactParameters });
  }

  getContactParameters(): Promise<string> {
    return LinphoneSdk.getContactParameters({ id: this.id });
  }
}

export class PreviewVideoView extends React.Component {
  render() {
    return <LinphoneVideoCaptureTextureView {...this.props} />;
  }
}

export class RemoteVideoView extends React.Component {
  render() {
    return <LinphoneVideoCaptureTextureView {...this.props} />;
  }
}
