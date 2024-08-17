import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit"
import store from '.';
import { SearchMode } from "../enums";

type MessagesState = {
    chatRooms: ChatRoom[];
    allChatRooms: ChatRoom[];
    activeChatRoom: ChatRoom | undefined;
    messages: Message[];
    showChatRooms: boolean;
    showChatRoom: boolean;

    searchMode: SearchMode;
    searchedMessages: Message[];
    selectedSearchedMessage: Message | undefined;
}

const initialState: MessagesState = {
    chatRooms: [],
    allChatRooms: [],
    activeChatRoom: undefined,
    messages: [],
    showChatRooms: true,
    showChatRoom: false,
    searchMode: SearchMode.CHAT_ROOMS,
    searchedMessages: [],
    selectedSearchedMessage: undefined
}

const messagesSlice = createSlice({
    name: 'messagesSlice',
    initialState,
    reducers: {
        addMessage(state, action: PayloadAction<Message>) {
            state.messages.push(action.payload)
        },
        setChatRooms(state, action: PayloadAction<ChatRoom[]>) {
            state.chatRooms = action.payload
        },
        setChatRoomLastMessage(state, action: PayloadAction<{ chatRoom: ChatRoom, lastMessage: string }>) {
            state.chatRooms.filter(m => m.chatRoomId == action.payload.chatRoom.chatRoomId)[0].lastMessage 
            = action.payload.lastMessage
        },
        sortChatRooms(state, action: PayloadAction<Message>) {
            var user = state.chatRooms.some(item => item.chatRoomId === action.payload.chatRoomId)
            if (user)
                state.chatRooms.unshift(state.chatRooms.splice(state.chatRooms.findIndex(item => item.chatRoomId === action.payload.chatRoomId), 1)[0])
            else
                state.chatRooms.unshift(state.chatRooms.splice(state.chatRooms.findIndex(item => item.chatRoomId === state.activeChatRoom?.chatRoomId), 1)[0])
        },
        addUnreadMessageToChatRoom(state, action: PayloadAction<ChatRoom>) {
            state.chatRooms.filter(u => u.chatRoomId == action.payload.chatRoomId)[0].unreadMessages += 1
        },
        removeChatRoomsUnreadMessages(state, action: PayloadAction<ChatRoom>) {
            state.chatRooms.filter(u => u.chatRoomId == action.payload.chatRoomId)[0].unreadMessages = 0
        },
        removeAllMessagesFromChat(state) {
            state.messages = []
        },
        setActiveChatRoom(state, action: PayloadAction<ChatRoom>) {
            state.activeChatRoom = action.payload
        },
        addChatRoom(state, action: PayloadAction<ChatRoom>) {
            state.chatRooms.push(action.payload)
        },
        setAllChatRooms(state, action: PayloadAction<ChatRoom[]>) {
            state.allChatRooms = action.payload
        },
        chatRoomWriting(state, action: PayloadAction<number>) {
            let chatRoom = state.chatRooms.filter(c => c.chatRoomId == action.payload)[0]
            if (chatRoom != null) {
                chatRoom.lastMessage = "Печатает..."
            }
            else
                console.error("EMPTY CHAT ROOM" + action.payload)
        },
        setChatRoomOnline(state, action: PayloadAction<{id: string, online: boolean}>) {
            console.log(action.payload.id)
            let chatRoom = state.chatRooms.filter(c => c.id == action.payload.id)[0]
            console.log(chatRoom)
            chatRoom.online = action.payload.online

            if (state.activeChatRoom != null) {
                if (state.activeChatRoom.id == action.payload.id)
                    state.activeChatRoom.online = action.payload.online
            }
        },
        setMessages(state, action: PayloadAction<Message[]>) {
            state.messages = action.payload
        },

        setChatRoomsShow(state, action: PayloadAction<boolean>) {
            state.showChatRooms = action.payload
        },
        setChatRoomShow(state, action: PayloadAction<boolean>) {
            state.showChatRoom = action.payload
        },
        setSearchMode(state, action: PayloadAction<SearchMode>) {
            state.searchMode = action.payload
        },
        setSearchedMessges(state, action: PayloadAction<Message[]>) {
            state.searchedMessages = action.payload
        },
        setSelectedSearchedMessage(state, action: PayloadAction<Message>) {
            state.selectedSearchedMessage = action.payload
        },
        resetTestState(state) {
            state.messages = []
        }
    }
});

export const { 
    setChatRooms,
    addUnreadMessageToChatRoom,
    sortChatRooms,
    setActiveChatRoom,
    setChatRoomLastMessage,
    addChatRoom,
    addMessage, 
    removeAllMessagesFromChat,
    removeChatRoomsUnreadMessages,
    setAllChatRooms,
    chatRoomWriting,
    setChatRoomOnline,
    setMessages,
    setChatRoomShow,
    setChatRoomsShow,
    setSearchMode,
    setSearchedMessges,
    setSelectedSearchedMessage,
    resetTestState 
} = messagesSlice.actions;
  
  export default messagesSlice.reducer;
