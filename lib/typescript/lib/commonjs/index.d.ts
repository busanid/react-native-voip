export const __esModule: boolean;
export const Call: any;
export const Core: any;
export const Helper: any;
export const LINPHONE_EVENT: {};
export const SipContext: any;
export const SipProvider: typeof _Hooks.SipProvider;
export const useAudioDevices: typeof _Hooks.useAudioDevices;
export const useCallScreening: typeof _CallScreening.useCallScreening;
export const useChat: typeof _Hooks.useChat;
export const useChatRoom: typeof _Hooks.useChatRoom;
export const usePushNotification: typeof _Hooks.usePushNotification;
export const useSIPClient: typeof _Hooks.useSIPClient;
export const useSIPClientStatus: typeof _Hooks.useSIPClientStatus;
export const useSIPPermission: typeof _Hooks.useSIPPermission;
export const useSipAccount: typeof _Hooks.useSipAccount;
export const useSipCore: typeof _Hooks.useSipCore;
export const useSipSetting: typeof _Hooks.useSipSetting;
export const useTargetAgent: typeof _Hooks.useTargetAgent;
export const useUnreadCountInfo: typeof _Hooks.useUnreadCountInfo;
export const Constants: any;
import _Hooks = require("./Hooks");
/** @deprecated use Core methods directly */
export function multiply(a: any, b: any): any;
import _CallScreening = require("./CallScreening");
declare const UserAgent_base: any;
export class UserAgent extends UserAgent_base {
    [x: string]: any;
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
declare const PreviewVideoView_base: any;
export class PreviewVideoView extends PreviewVideoView_base {
    [x: string]: any;
    render(): any;
}
declare const RemoteVideoView_base: any;
export class RemoteVideoView extends RemoteVideoView_base {
    [x: string]: any;
    render(): any;
}
export {};
//# sourceMappingURL=index.d.ts.map