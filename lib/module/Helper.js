import { NativeModules, Platform } from 'react-native';
const LINKING_ERROR = `The package 'react-native-linphone-sdk' doesn't seem to be linked. Make sure: \n\n` + Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ''
}) + '- You rebuilt the app after installing the package\n' + '- You are not using Expo Go\n';
const LinphoneSdk = NativeModules.LinphoneSdk ? NativeModules.LinphoneSdk : new Proxy({}, {
  get() {
    throw new Error(LINKING_ERROR);
  }
});
export default {
  getDefaultRingtoneUri: () => {
    return LinphoneSdk.getDefaultRingtoneUri();
  },
  refreshRegisters: () => {
    return LinphoneSdk.refreshRegisters();
  },
  makePhoneCall: options => {
    options.type = options.type || "tel";
    return LinphoneSdk.makePhoneCall(options);
  }
};
//# sourceMappingURL=Helper.js.map