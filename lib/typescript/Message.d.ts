export interface ChatRoom {
    peerAddress: string;
    subject: string;
    localAddress: string;
    state: string;
}
export interface IMessage {
    messageId: string;
    contentType: string;
    fromAddress: string;
    toAddress: string;
    state: string;
    text: string;
}
export interface IChatInfoEvent {
    chatRoom: ChatRoom;
    message: IMessage;
}
export interface IMessageStateChangeEvent {
    messageId: string;
    state: string;
}
export interface IMessageReceivedEvent {
    message: IMessage;
    chatRoom: ChatRoom;
}
declare const _default: {
    createChatRoom: (options: {
        targetSipUri: string;
    }) => any;
    getChatRooms: () => any;
    deleteChatRoom: (options: {
        targetSipUri: string;
    }) => any;
    sendMessage: (chatRoom: ChatRoom, message: string) => any;
    getChatRoomHistory: (chatRoom: ChatRoom) => any;
    markAsRead: (chatRoom: ChatRoom) => any;
};
export default _default;
//# sourceMappingURL=Message.d.ts.map