import React, { FC, useEffect, useRef, useState } from 'react'
import './styles.scss';
import connection from '../../middlewares/signalrMiddleware';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setIsTestStarted } from '../../store/testSlice';
import { sendMessage } from '../../store/hubConnectionSlice';
import { setActiveChatRoom, setChatRoomLastMessage, setChatRooms, sortChatRooms, setAllChatRooms, chatRoomWriting, setChatRoomOnline,
    setChatRoomsShow, setChatRoomShow,
    setSearchMode
 } from '../../store/messagesSlice';
import { addMessage } from '../../store/messagesSlice';
import store from '../../store';
import axios from 'axios';
import { environment } from '../../settings';
import { SearchMode } from '../../enums';

interface ChatWindowProps {

}

const ChatWindow: FC<ChatWindowProps> = ({}) => {
    const [width, setWidth] = useState(window.innerWidth);

    const connected = useAppSelector(state => state.hubConnectionSlice.connected)
    const userId = useAppSelector(state => state.userSlice?.id);
    const userAvatar = useAppSelector(state => state.userSlice?.avatar)

    const isAuthenticated = useAppSelector(state => state.userSlice.isAuthenticated);
    const activeChatRoomId = useAppSelector(state => state.messagesSlice.activeChatRoom?.chatRoomId);
    const activeChatRoom = useAppSelector(state => state.messagesSlice?.activeChatRoom);
    const chatRooms = useAppSelector(state => state.messagesSlice.chatRooms);
    const allChatRooms = useAppSelector(state => state.messagesSlice.allChatRooms);
    const firstName = useAppSelector(state => state.userSlice.firstName);
    const messages = useAppSelector(state => state.messagesSlice.messages);

    const searchMode = useAppSelector(state => state.messagesSlice.searchMode)
    const selectedSearchedMessage = useAppSelector(state => state.messagesSlice.selectedSearchedMessage)

    const dispatch = useAppDispatch();

    const [text, setText] = useState<string>("");

    const [writing, setWriting] = useState<boolean>(true);
    const timerId = useRef<NodeJS.Timeout | null>(null);

    const chatSelected = activeChatRoomId != null;

    const handleKeywordKeypress = (e: any) => {
        if (writing) {
            setWriting(false)
            if (activeChatRoom!.chatRoomId != 0)
                writingMessage(activeChatRoom!.chatRoomId)
        }
      
        if (e.nativeEvent.code == 'Enter') {
            e.preventDefault();
            console.log(connection.connectionId)
            console.log(chatSelected)
            console.log(connected)
            if (connected && chatSelected) {
                 sendMessage(
                    {
                        chatRoomId: activeChatRoomId,
                        text: e.target.value,
                        senderId: userId!
                    })

                if (chatRooms.length != allChatRooms.length)
                    dispatch(setChatRooms(allChatRooms))
            }

            setText("");
        }
    };

    const handleKeyUp = () => {
        // Сбрасываем предыдущий таймер
        if (timerId.current) {
          clearTimeout(timerId.current);
        }
    
        // Запускаем новый таймер, который отправит запрос через 5 секунд
        timerId.current = setTimeout(() => {
          setWriting(true)
        }, 5000);
      };

    const writingMessage = (chatRoomId: number) => {
        const config = {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        };
        console.log(chatRoomId)
        axios.post(environment.apiUrl + "/api/chats/writingMessage?chatRoomId=" + chatRoomId, {}, config)
            .then((e) => {
                setTimeout(() => setWriting(true), 3000)
            })
    }

    const sendMessage = (message: Message) => {
        console.log(message)
        console.log(message.chatRoomId)

        const config = {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        };

        // If chatroom doesn't exists, create chatroom
        if (message.chatRoomId == 0) {
            const userIds = [userId, activeChatRoom!.getterId]

            axios.post(environment.apiUrl + "/api/chats/createChatRoom", { userIds }, config)
            .then((e) => {
                console.log(e.data)

                var chatRoom = e.data.chatRoom

                if (chatRoom) {
                const room = {
                    chatRoomId: chatRoom.chatRoomId,
                    getterId: "chatRoom.id",
                    avatar: activeChatRoom!.avatar,
                    chatRoomName: activeChatRoom!.chatRoomName,
                    lastMessage: chatRoom.lastMessage,
                    unreadMessages: 0,
                    userName: "user_name",
                    online: chatRoom.online // TODO
                }

                const rooms = [...allChatRooms, room]
                dispatch(setAllChatRooms(rooms))
                dispatch(setChatRooms(rooms))

                dispatch(setActiveChatRoom(room))
                console.log(room)
                console.log(activeChatRoom)
                message.chatRoomId = e.data.chatRoomId
                console.log(message)

                axios.post(environment.apiUrl + `/api/chats/sendMessage`, message, config)
                .then((e) => {
                    console.log(e)
                })
                }
            });
        } else {
            console.log(message)
            axios.post(environment.apiUrl + `/api/chats/sendMessage`, message, config)
            .then((e) => {
                console.log(e)
            })
        }
    }

    const getTime = () => {
        const date = new Date()
        const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes().toString() : date.getMinutes();
        return date.getHours() + ':' + minutes;
    }

    const getTimeOfMessage = (date: Date) => {
        const dateString = new Date(date)
        const minutes = dateString.getMinutes() < 10 ? '0' + dateString.getMinutes().toString() : dateString.getMinutes();
        return dateString.getHours() + ':' + minutes;
    }

    useEffect(() => {
        connection.on("SEND_MESSAGE", (message) => {
            console.log(message)
            if (store.getState().hubConnectionSlice.connected) {
                if (message.senderId == store.getState().userSlice?.id 
                || (message.chatRoomId == store.getState().messagesSlice.activeChatRoom?.chatRoomId)) {
                    dispatch(addMessage({ 
                        id: message.id,
                        chatRoomId: message.chatRoomId,
                        senderId: message.senderId, 
                        text: message.text,
                        date: message.date,
                        senderName: message.senderName,
                        senderAvatar: message.senderAvatar
                     }))
                }
            }
        });
    }, []);
    
    return (
        <div className='chat'>
            { activeChatRoom ?
            <div className='chat-room-content'>
            <div id='chatRoom' className='chat-room'>
                <div className='row chat-header'>
                    <div className='info'>
                        {
                            width <= 400 ?
                        <div className='block'>
                            <img onClick={() => { 
                                dispatch(setChatRoomShow(false))
                                dispatch(setChatRoomsShow(true))
                            }} className='back' src='./back.png' />
                        </div> 
                        : <></>
                        }
                        <div className='flex-block'>
                            <div className='block'>
                                <div className='avatar'>{activeChatRoom?.avatar != null ? <img src={environment.apiUrl + "/Assets/Images/" + activeChatRoom?.avatar + "_medium.png"} /> : activeChatRoom?.chatRoomName[0]}</div>
                            </div>
                            <div className='block'>
                                <div className='name'>{activeChatRoom?.chatRoomName}</div>
                                <div className='status'>{activeChatRoom?.online ? <span className='online'>online</span> : <span className='offline'>Был (а) недавно</span>}</div>
                            </div>
                        </div>
                        
                        <div className='block search-block'>
                            <button className={searchMode == SearchMode.MESSAGES ? 'active' : ''} onClick={() => dispatch(setSearchMode(searchMode == SearchMode.CHAT_ROOMS ? SearchMode.MESSAGES : SearchMode.CHAT_ROOMS))}><img src="./search.webp"></img></button>
                        </div>
                    </div>
                </div>
                <div className='row messages' id="messageList">
                    <div className='messages-content'>
                    {messages.map((m, i) => 
                    <div id={"message_" + m.id} key={i} className={'message-container ' + (selectedSearchedMessage != undefined ? (selectedSearchedMessage.id == m .id ? 'selectedSearchedMessage' : '') : '')}>
                        
                        {m.senderId != userId ? <div className='avatar sender'>
                            {m.senderAvatar != null ? <img src={environment.apiUrl + "/Assets/Images/" + m.senderAvatar + "_medium.png"} /> 
                                : (m.senderName != null ? m.senderName[0] : "")}
                        </div> : <></>}

                        <div className={m.senderId == userId ? 'message sended-message' : 'message inbox-message'} key={i}>
                            {i == 0 || (messages[i] != null && messages[i - 1].senderId != messages[i].senderId) ? <div className='sender-name'>{m.senderName}</div> : <></>}
                            <div className='data'>
                                <div className='text'>{m.text}</div>
                                <div className='time'>{getTimeOfMessage(m.date!)}</div>
                            </div>
                        </div>
                        {m.senderId == userId ? <div className='avatar getter'>
                            
                            {userAvatar != null ? <img src={environment.apiUrl + "/Assets/Images/" + userAvatar + "_medium.png"} /> 
                                : (firstName != null ? firstName[0] : "")}
                        </div> : <></>}
                    </div>
                    )}
                    </div>
                </div>
                <div className='row input'>
                    <div className='attachment'>
                        <button><img src='./attachment.svg'></img></button>
                    </div>
                    <div className='text-field'>
                        <textarea 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Введите сообщение..." 
                        onKeyDown={handleKeywordKeypress}
                        onKeyUp={handleKeyUp}></textarea>
                    </div>
                    <div className='action-buttons'>
                        <button className='sticker'><img src='./smile.png' ></img></button>
                        <button onClick={() => 
                                connected && chatSelected
                                ? sendMessage(
                                    {
                                        chatRoomId: activeChatRoomId,
                                        text: text,
                                        senderId: userId!
                                    }) : {}
                            }>
                            <img src='./send-blue-1.png'></img>
                        </button>
                    </div>
                </div>
            </div>
            

            </div>  
            : 
            <div className='content'>
                <div className='choose-user'>
                    <span>Выберите пользователя для переписки</span>
                </div>
            </div>
            }
        </div>
    )
}

export default ChatWindow
