type User = {
    id: string;
    userName: string;
    firstName: string;
    lastName: string;
}

type ChatRoom = {
    id: string | undefined;
    avatar: string | undefined;
    chatRoomId: number;
    chatRoomName: string;
    lastMessage: string;
    unreadMessages: number;
    online: boolean;
}

type Message = {
    senderId: string;
    text: string;
    chatRoomId: number;
    senderName?: string;
    senderAvatar?: string;
}

// ViewModels


type AuthenticateModel = {
    userName: string | undefined;
    password: string | undefined;
}

type MessageSendModel = {
    userToId: string;
    message: Message;
}