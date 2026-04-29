import React from 'react';
import type { CallOptions } from './types';
import Session, { LINPHONE_EVENT } from './Session';
export { LINPHONE_EVENT };
import EventEmitter from 'events';
import { SipProvider, useSIPClient, useSIPClientStatus, useSIPPermission, SipContext, useTargetAgent, useSipAccount, useSipCore, useSipSetting, useAudioDevices, useChat, useChatRoom, useUnreadCountInfo, usePushNotification, useCallScreening } from './Hooks';
export { SipProvider, useSIPClient, useSIPClientStatus, useSIPPermission, SipContext, useTargetAgent, useSipAccount, useSipCore, useSipSetting, useAudioDevices, useChat, useChatRoom, useUnreadCountInfo, usePushNotification, useCallScreening, };
import Helper from './Helper';
export { Helper };
import Call from './Call';
export { Call };
import Core from './Core';
export { Core };
export * from './types';
export * from './PushNotification';
export * from './CallScreening';
declare const Constants: any;
export { Constants };
/** @deprecated use Core methods directly */
export declare function multiply(a: number, b: number): Promise<number>;
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
export declare class UserAgent extends EventEmitter {
    private configuration;
    isRegistered: boolean;
    isProgress: boolean;
    error: string;
    id: string;
    username: string;
    password: string;
    domain: string;
    displayName: string;
    remark: string;
    proxyDomain: string;
    transportType: string;
    stunDomain: string;
    stunPort: string;
    stunEnabled: boolean;
    isDefault: boolean;
    private sessions;
    constructor(configuration: Configuration);
    getUsername(): string;
    getConfiguration(): Configuration;
    setIsDefault(isDefault: boolean): boolean;
    stop(): Promise<void>;
    register(): Promise<boolean>;
    unregister(): Promise<boolean>;
    getCallLogs(format?: boolean): Promise<any[]>;
    clearCallLogs(): Promise<boolean>;
    addSession(session: Session): void;
    terminateSessions(targetSession?: Session): Promise<void>;
    getSession(callId: string): Promise<Session | false>;
    call(target: string, options: CallOptions): Promise<string | undefined>;
    updateAccount(newSipConfig: Configuration): Promise<boolean>;
    remove(): Promise<boolean>;
    setContactUriParameters(contactUriParameters: string): Promise<boolean>;
    getContactUriParameters(): Promise<string>;
    setContactParameters(contactParameters: string): Promise<boolean>;
    getContactParameters(): Promise<string>;
}
export declare class PreviewVideoView extends React.Component {
    render(): React.JSX.Element;
}
export declare class RemoteVideoView extends React.Component {
    render(): React.JSX.Element;
}
//# sourceMappingURL=index.d.ts.map