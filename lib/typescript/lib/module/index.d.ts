/** @deprecated use Core methods directly */
export function multiply(a: any, b: any): any;
export * from "./types";
export * from "./PushNotification";
export * from "./CallScreening";
export class UserAgent {
    constructor(configuration: any);
    configuration: any;
    isRegistered: boolean;
    isProgress: boolean;
    error: string;
    id: any;
    username: any;
    password: any;
    domain: any;
    displayName: any;
    remark: any;
    proxyDomain: any;
    transportType: any;
    stunDomain: any;
    stunPort: any;
    stunEnabled: any;
    isDefault: any;
    sessions: any[];
    getUsername(): any;
    getConfiguration(): any;
    setIsDefault(isDefault: any): any;
    stop(): Promise<void>;
    register(): any;
    unregister(): any;
    getCallLogs(format?: boolean): Promise<any>;
    clearCallLogs(): Promise<any>;
    addSession(session: any): void;
    terminateSessions(targetSession: any): Promise<void>;
    getSession(callId: any): Promise<any>;
    call(target: any, options: any): Promise<any>;
    updateAccount(newSipConfig: any): Promise<any>;
    remove(): Promise<any>;
    setContactUriParameters(contactUriParameters: any): Promise<any>;
    getContactUriParameters(): any;
    setContactParameters(contactParameters: any): Promise<any>;
    getContactParameters(): any;
}
export class PreviewVideoView extends React.Component<any, any, any> {
    constructor(props: any);
    constructor(props: any, context: any);
    render(): React.CElement<any, React.Component<any, {}, any> & Readonly<import("react-native").NativeMethods>>;
}
export class RemoteVideoView extends React.Component<any, any, any> {
    constructor(props: any);
    constructor(props: any, context: any);
    render(): React.CElement<any, React.Component<any, {}, any> & Readonly<import("react-native").NativeMethods>>;
}
import { LINPHONE_EVENT } from "./Session";
import { SipProvider } from "./Hooks";
import { useSIPClient } from "./Hooks";
import { useSIPClientStatus } from "./Hooks";
import { useSIPPermission } from "./Hooks";
import { SipContext } from "./Hooks";
import { useTargetAgent } from "./Hooks";
import { useSipAccount } from "./Hooks";
import { useSipCore } from "./Hooks";
import { useSipSetting } from "./Hooks";
import { useAudioDevices } from "./Hooks";
import { useChat } from "./Hooks";
import { useChatRoom } from "./Hooks";
import { useUnreadCountInfo } from "./Hooks";
import { usePushNotification } from "./Hooks";
import { useCallScreening } from "./Hooks";
import Helper from "./Helper";
import Call from "./Call";
import Core from "./Core";
export const Constants: any;
import React from "react";
export { LINPHONE_EVENT, SipProvider, useSIPClient, useSIPClientStatus, useSIPPermission, SipContext, useTargetAgent, useSipAccount, useSipCore, useSipSetting, useAudioDevices, useChat, useChatRoom, useUnreadCountInfo, usePushNotification, useCallScreening, Helper, Call, Core };
//# sourceMappingURL=index.d.ts.map