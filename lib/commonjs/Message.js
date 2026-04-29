"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _reactNative = require("react-native");
const LINKING_ERROR = `The package 'react-native-linphone-sdk' doesn't seem to be linked. Make sure: \n\n` + _reactNative.Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ''
}) + '- You rebuilt the app after installing the package\n' + '- You are not using Expo Go\n';
const LinphoneSdk = _reactNative.NativeModules.LinphoneSdk ? _reactNative.NativeModules.LinphoneSdk : new Proxy({}, {
  get() {
    throw new Error(LINKING_ERROR);
  }
});
var _default = {
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
exports.default = _default;
//# sourceMappingURL=Message.js.map