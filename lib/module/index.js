import React from 'react';
import { NativeModules, Platform } from 'react-native';
import { LINPHONE_EVENT } from './Session';
export { LINPHONE_EVENT };
import { LinphoneVideoCaptureTextureView } from './LinphoneVideoCaptureTextureView';
import EventEmitter from 'events';
import { SipProvider, useSIPClient, useSIPClientStatus, useSIPPermission, SipContext, useTargetAgent, useSipAccount, useSipCore, useSipSetting, useAudioDevices, useChat, useChatRoom, useUnreadCountInfo, usePushNotification, useCallScreening } from './Hooks';
import CallLog from './CallLog';
export { SipProvider, useSIPClient, useSIPClientStatus, useSIPPermission, SipContext, useTargetAgent, useSipAccount, useSipCore, useSipSetting, useAudioDevices, useChat, useChatRoom, useUnreadCountInfo, usePushNotification, useCallScreening };
import Helper from './Helper';
export { Helper };
import Call from './Call';
export { Call };
import Core from './Core';
export { Core };
export * from './types';
export * from './PushNotification';
export * from './CallScreening';
const LINKING_ERROR = `The package 'react-native-voip' doesn't seem to be linked. Make sure: \n\n` + Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ''
}) + '- You rebuilt the app after installing the package\n' + '- You are not using Expo Go\n';
const LinphoneSdk = NativeModules.LinphoneSdk ? NativeModules.LinphoneSdk : new Proxy({}, {
  get() {
    throw new Error(LINKING_ERROR);
  }
});
const Constants = LinphoneSdk.getConstants();
export { Constants };

/** @deprecated use Core methods directly */
export function multiply(a, b) {
  return LinphoneSdk.multiply(a, b);
}
export class UserAgent extends EventEmitter {
  constructor(configuration) {
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
  getUsername() {
    return this.username;
  }
  getConfiguration() {
    return {
      ...this.configuration,
      isDefault: this.isDefault
    };
  }
  setIsDefault(isDefault) {
    this.isDefault = isDefault;
    if (isDefault) {
      Core.setDefaultAccount(this);
    }
    return isDefault;
  }
  async stop() {
    try {
      await this.unregister();
      this.terminateSessions();
      await LinphoneSdk.stop();
    } catch (err) {
      console.error('Failed to stop UserAgent.', err);
    }
  }
  register() {
    return LinphoneSdk.registerIt(this.configuration);
  }
  unregister() {
    this.isRegistered = false;
    return LinphoneSdk.unregister(this.configuration);
  }
  async getCallLogs(format = true) {
    const callLogs = await LinphoneSdk.getCallLogs();
    if (format) {
      return CallLog.formatLinphone(callLogs);
    }
    return callLogs;
  }
  async clearCallLogs() {
    return LinphoneSdk.clearCallLogs();
  }
  addSession(session) {
    this.sessions.unshift(session);
  }
  async terminateSessions(targetSession) {
    if (!this.sessions || !Array.isArray(this.sessions)) return;
    for (let i = 0; i < this.sessions.length; i++) {
      try {
        const session = this.sessions[i];
        if (targetSession) {
          if (targetSession.callId === (session === null || session === void 0 ? void 0 : session.callId)) {
            await (session === null || session === void 0 ? void 0 : session.terminate());
            this.sessions.splice(i, 1);
          }
        } else {
          await (session === null || session === void 0 ? void 0 : session.terminate());
          this.sessions.splice(i, 1);
        }
      } catch (error) {
        console.error(`Failed to terminate session: ${error}`);
      }
    }
  }
  async getSession(callId) {
    for (const session of this.sessions) {
      if (session.callId === callId) return session;
    }
    return false;
  }
  async call(target, options) {
    try {
      return await LinphoneSdk.call(target, options);
    } catch (e) {
      console.error('Call failed.', e);
    }
  }
  async updateAccount(newSipConfig) {
    const prevSipConfig = {
      username: this.username,
      password: this.password,
      domain: this.domain
    };
    return LinphoneSdk.updateAccount({
      prevSipConfig,
      newSipConfig
    });
  }
  async remove() {
    const prevSipConfig = {
      id: this.id,
      username: this.username,
      password: this.password,
      domain: this.domain
    };
    return LinphoneSdk.remove(prevSipConfig);
  }
  async setContactUriParameters(contactUriParameters) {
    return LinphoneSdk.setContactUriParameters({
      id: this.id,
      contactUriParameters
    });
  }
  getContactUriParameters() {
    return LinphoneSdk.getContactUriParameters({
      id: this.id
    });
  }
  async setContactParameters(contactParameters) {
    return LinphoneSdk.setContactParameters({
      id: this.id,
      contactParameters
    });
  }
  getContactParameters() {
    return LinphoneSdk.getContactParameters({
      id: this.id
    });
  }
}
export class PreviewVideoView extends React.Component {
  render() {
    return /*#__PURE__*/React.createElement(LinphoneVideoCaptureTextureView, this.props);
  }
}
export class RemoteVideoView extends React.Component {
  render() {
    return /*#__PURE__*/React.createElement(LinphoneVideoCaptureTextureView, this.props);
  }
}
//# sourceMappingURL=index.js.map