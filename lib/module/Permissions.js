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
  openOverlaySettings: () => {
    return LinphoneSdk.openOverlaySettings();
  },
  openPowerSettings: () => {
    return LinphoneSdk.openPowerSettings();
  },
  isIgnoringBatteryOptimizations: () => {
    return LinphoneSdk.isIgnoringBatteryOptimizations();
  },
  openNotificationSettings: () => {
    return LinphoneSdk.openNotificationSettings();
  },
  checkOverlayPermission: () => {
    return LinphoneSdk.checkOverlayPermission();
  },
  enterBackground: () => {
    if (Platform.OS == "android") {
      return LinphoneSdk.enterBackground();
    } else {
      console.log('enterBackground只支持android');
    }
  },
  enterForeground: () => {
    if (Platform.OS == "android") {
      return LinphoneSdk.enterForeground();
    } else {
      console.log("enterForeground只支持android");
    }
  }
};
//# sourceMappingURL=Permissions.js.map