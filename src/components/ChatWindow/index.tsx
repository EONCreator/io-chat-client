import React, { FC, useEffect, useRef, useState } from 'react'
import './styles.scss';
import connection from '../../middlewares/signalrMiddleware';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setIsTestStarted } from '../../store/testSlice';
import { sendMessage } from '../../store/hubConnectionSlice';
import { setActiveChatRoom, setChatRoomLastMessage, setChatRooms, sortChatRooms, setAllChatRooms, chatRoomWriting, setChatRoomOnline } from '../../store/messagesSlice';
import { addMessage } from '../../store/messagesSlice';
import store from '../../store';
import axios from 'axios';
import { environment } from '../../settings';

interface ChatWindowProps {

}

const ChatWindow: FC<ChatWindowProps> = ({}) => {
    const userId = useAppSelector(state => state.userSlice?.id);
    const userAvatar = useAppSelector(state => state.userSlice?.avatar)

    const isAuthenticated = useAppSelector(state => state.userSlice.isAuthenticated);
    const activeChatRoomId = useAppSelector(state => state.messagesSlice.activeChatRoom?.chatRoomId);
    const activeChatRoom = useAppSelector(state => state.messagesSlice?.activeChatRoom);
    const chatRooms = useAppSelector(state => state.messagesSlice.chatRooms);
    const allChatRooms = useAppSelector(state => state.messagesSlice.allChatRooms);
    const firstName = useAppSelector(state => state.userSlice.firstName);
    const messages = useAppSelector(state => state.messagesSlice.messages);
    const dispatch = useAppDispatch();

    const [text, setText] = useState<string>("");

    const [writing, setWriting] = useState<boolean>(true);
    const timerId = useRef<NodeJS.Timeout | null>(null);

    const chatSelected = activeChatRoomId != null;

    const handleKeywordKeypress = (e: any) => {
        if (writing) {
            setWriting(false)
            writingMessage(activeChatRoom!.chatRoomId)
        }
      
        if (e.nativeEvent.code == 'Enter') {
            e.preventDefault();
            if (connection.connectionId && chatSelected) {
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
            const ids = [userId, activeChatRoom!.id]

            axios.post(environment.apiUrl + "/api/chats/createChatRoom", { ids }, config)
            .then((e) => {
                console.log(e.data)

                const room = {
                    chatRoomId: e.data.chatRoomId,
                    id: "chatRoom.id",
                    avatar: activeChatRoom!.avatar,
                    chatRoomName: activeChatRoom!.chatRoomName,
                    lastMessage: e.data.lastMessage,
                    unreadMessages: 0,
                    userName: "user_name",
                    online: e.data.online
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

    useEffect(() => {
        connection.on("send", (message) => {
            console.log(message)
            if (connection.connectionId != null) {
                if (message.senderId == store.getState().userSlice?.id 
                || (message.chatRoomId == store.getState().messagesSlice.activeChatRoom?.chatRoomId)) {
                    dispatch(addMessage({ 
                        chatRoomId: message.chatRoomId,
                        senderId: message.senderId, 
                        text: message.text,
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
            <div>
            <div className='chat-room'>
                <div className='row chat-header'>
                    <div className='info'>
                        <div className='block'>
                            <div className='avatar'>{activeChatRoom?.avatar != null ? <img src={environment.apiUrl + "/Assets/Images/" + activeChatRoom?.avatar + "_medium.png"} /> : activeChatRoom?.chatRoomName[0]}</div>
                        </div>
                        <div className='block'>
                            <div className='name'>{activeChatRoom?.chatRoomName}</div>
                            <div className='status'>{activeChatRoom?.online ? <span className='online'>online</span> : <span className='offline'>Был (а) недавно</span>}</div>
                        </div>
                    </div>
                </div>
                <div className='row messages'>
                    <div className='messages-content'>
                    {messages.map((m, i) => 
                    <div key={i} className='message-container'>
                        
                        {m.senderId != userId ? <div className='avatar sender'>
                            {m.senderAvatar != null ? <img src={"http://localhost:5010/Assets/Images/" + m.senderAvatar + "_medium.png"} /> 
                                : (m.senderName != null ? m.senderName[0] : "")}
                        </div> : <></>}

                        <div className={m.senderId == userId ? 'message sended-message' : 'message inbox-message'} key={i}>
                            {i == 0 || (messages[i] != null && messages[i - 1].senderId != messages[i].senderId) ? <div className='sender-name'>{m.senderName}</div> : <></>}
                            <div className='data'>
                                <div className='text'>{m.text}</div>
                                <div className='time'>{getTime()}</div>
                            </div>
                        </div>
                        {m.senderId == userId ? <div className='avatar getter'>
                            
                            {userAvatar != null ? <img src={"http://localhost:5010/Assets/Images/" + userAvatar + "_medium.png"} /> 
                                : (firstName != null ? firstName[0] : "")}
                        </div> : <></>}
                    </div>
                    )}
                    </div>
                </div>
                <div className='row input'>
                    {writing}
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
                                connection.connectionId && chatSelected
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
                <div className='choose-user'>Выберите пользователя для переписки</div>
            </div>
            }
        </div>
    )
}

export default ChatWindow
