import { NativeModules, Platform } from "react-native";

export interface ChatRoom {
    peerAddress: string
    subject: string
    localAddress: string
    state: string
}

export interface IMessage {
    messageId: string
    contentType: string
    fromAddress: string
    toAddress: string
    state: string
    text: string
}

export interface IChatInfoEvent {
    chatRoom: ChatRoom
    message: IMessage
}

export interface IMessageStateChangeEvent {
    messageId: string
    state: string
}

export interface IMessageReceivedEvent {
    message: IMessage
    chatRoom: ChatRoom
}

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

export default {
    createChatRoom: (options: { targetSipUri: string }) => {
        return LinphoneSdk.createChatRoom(options);
    },
    getChatRooms: () => {
        return LinphoneSdk.getChatRooms();
    },
    deleteChatRoom: (options: { targetSipUri: string }) => {
        return LinphoneSdk.deleteChatRoom(options);
    },
    sendMessage: (chatRoom: ChatRoom, message: string) => {
        return LinphoneSdk.sendMessage({
            targetSipUri: chatRoom.peerAddress,
            message
        });
    },
    getChatRoomHistory: (chatRoom: ChatRoom) => {
        return LinphoneSdk.getChatRoomHistory({
            targetSipUri: chatRoom.peerAddress
        })
    },
    markAsRead: (chatRoom: ChatRoom) => {
        return LinphoneSdk.markAsRead({
            targetSipUri: chatRoom.peerAddress
        })
    }
}