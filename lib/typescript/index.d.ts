/// <reference types="node" />
import React from 'react';
import type { CallOptions } from './Call';
import Session, { LINPHONE_EVENT } from './Session';
export { LINPHONE_EVENT };
import EventEmitter from 'events';
import { SipProvider, useSIPClient, useSIPClientStatus, useSIPPermission, SipContext, useTargetAgent, useSipAccount, useSipCore, useSipSetting, useAudioDevices, useChat, useChatRoom, useUnreadCountInfo } from './Hooks';
export { SipProvider, useSIPClient, useSIPClientStatus, useSIPPermission, SipContext, useTargetAgent, useSipAccount, useSipCore, useSipSetting, useAudioDevices, useChat, useChatRoom, useUnreadCountInfo };
import Helper from './Helper';
export { Helper };
import Call from './Call';
export { Call };
import Core from './Core';
export { Core };
declare const Constants: any;
export { Constants };
export declare function multiply(a: number, b: number): Promise<number>;
export type Configuration = {
    id: String;
    username: String;
    password: String;
    domain: String;
    displayName: String;
    remark: String;
    isDefault: boolean;
    proxyDomain: String;
    transportType: String;
    stunDomain: String;
    stunPort: String;
    stunEnabled: Boolean;
    contactParams: String;
};
export type registerEvent = {
    originator: String;
    message: String;
    session: Session;
};
export declare class UserAgent extends EventEmitter {
    private configuration;
    isRegistered: Boolean;
    isProgress: Boolean;
    error: string;
    id: String;
    username: String;
    password: String;
    domain: String;
    displayName: String;
    remark: String;
    proxyDomain: String;
    transportType: String;
    stunDomain: String;
    stunPort: String;
    stunEnabled: Boolean;
    isDefault: boolean;
    private sessions;
    constructor(configuration: Configuration);
    getUsername(): String;
    getConfiguration(): {
        isDefault: boolean;
        id: String;
        username: String;
        password: String;
        domain: String;
        displayName: String;
        remark: String;
        proxyDomain: String;
        transportType: String;
        stunDomain: String;
        stunPort: String;
        stunEnabled: Boolean;
        contactParams: String;
    };
    setIsDefault(isDefault: boolean): boolean;
    stop(): Promise<void>;
    register(): any;
    unregister(): any;
    getCallLogs(format?: boolean): Promise<any>;
    clearCallLogs(): Promise<any>;
    addSession(session: Session): void;
    terminateSessions(targetSession?: Session): Promise<void>;
    getSession(callId: string): Promise<false | Session>;
    call(target: string, options: CallOptions): Promise<any>;
    updateAccount(newSipConfig: Configuration): Promise<any>;
    remove(): Promise<any>;
    setContactUriParameters(contactUriParameters: String): Promise<any>;
    getContactUriParameters(): any;
    setContactParameters(contactParameters: String): Promise<any>;
    getContactParameters(): any;
}
export declare class PreviewVideoView extends React.Component {
    render(): JSX.Element;
}
export declare class RemoteVideoView extends React.Component {
    render(): JSX.Element;
}
//# sourceMappingURL=index.d.ts.map