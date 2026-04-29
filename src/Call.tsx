import { NativeModules, Platform } from 'react-native';
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

export type CallOptions = {
    /*eventHandlers: {
        progress: Function,
        failed: Function,
        ended: Function,
        confirmed: Function,
        released: Function
    },*/
    mediaConstraints: {
        audio: boolean,
        video: boolean
    }
}

export const STATE = LinphoneSdk.CALL_STATE

export default {
    STATE
}