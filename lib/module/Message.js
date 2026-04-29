import { NativeModules, Platform } from "react-native";
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
  createChatRoom: options => {
    return LinphoneSdk.createChatRoom(options);
  },
  getChatRooms: () => {
    return LinphoneSdk.getChatRooms();
  },
  deleteChatRoom: options => {
    return LinphoneSdk.deleteChatRoom(options);
  },
  sendMessage: (chatRoom, message) => {
    return LinphoneSdk.sendMessage({
      targetSipUri: chatRoom.peerAddress,
      message
    });
  },
  getChatRoomHistory: chatRoom => {
    return LinphoneSdk.getChatRoomHistory({
      targetSipUri: chatRoom.peerAddress
    });
  },
  markAsRead: chatRoom => {
    return LinphoneSdk.markAsRead({
      targetSipUri: chatRoom.peerAddress
    });
  }
};
//# sourceMappingURL=Message.js.map