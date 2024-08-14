import React, { FC, useEffect, useRef, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setFirstName, setLastName, setToken, setUserName } from '../../store/userSlice';
import axios from 'axios';
import { addChatRoom, addUnreadMessageToChatRoom, removeAllMessagesFromChat, removeChatRoomsUnreadMessages, setActiveChatRoom, setChatRoomLastMessage, setChatRooms, sortChatRooms, setAllChatRooms, chatRoomWriting, setChatRoomOnline } from '../../store/messagesSlice';
import './styles.scss';
import connection from '../../middlewares/signalrMiddleware';
import store from '../../store';
import ConnectionStatus from './components/ConnectionStatus';

interface ChatRoomsProps {
    
}

const ChatRooms: FC<ChatRoomsProps> = () => {
    const userId = useAppSelector(state => state.userSlice?.id);
    const chatRooms = useAppSelector(state => state.messagesSlice.chatRooms);
    const allChatRooms = useAppSelector(state => state.messagesSlice.allChatRooms);
    const activeChatRoom = useAppSelector(state => state.messagesSlice.activeChatRoom);
    const dispatch = useAppDispatch();

    const [activeChatRoomIndex, setActiveChatRoomIndex] = useState<number>();

    const timerId = useRef<NodeJS.Timeout | null>(null);

    const searchChatRoom = (e: any) => {
        if (e.target.value.length == 0)
            dispatch(setChatRooms(allChatRooms))
        else {
            dispatch(setChatRooms(chatRooms.filter(c => 
                c.chatRoomName.includes(e.target.value))))
        }
    };

    const search = (e: any) => {
          if (e.nativeEvent.code == 'Enter') {
            if (chatRooms.length == 0)
              findUser(e.target.value)
          }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    const getChatRooms = () => {
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      };
      axios.get("http://localhost:5010/api/chats/getChatRooms", config)
      .then(e => {
        console.log(e.data.chatRooms)
        dispatch(setChatRooms(e.data.chatRooms))
        console.log(chatRooms)
        dispatch(setAllChatRooms(e.data.chatRooms))
      });
    }

    if (token != null)
        getChatRooms();
  }, []);

  useEffect(() => {
    connection.on("send", (message) => {
        console.log(message)
        console.log(allChatRooms)
        if (connection.connectionId != null) {
          const chatRoom = chatRooms.filter(u => u.chatRoomId == message.chatRoomId)[0]

          if (chatRoomIsExists(chatRoom)) {
            if (message.chatRoomId != store.getState().messagesSlice.activeChatRoom?.chatRoomId) {
                dispatch(addUnreadMessageToChatRoom(chatRoom))
            }
            dispatch(setChatRoomLastMessage({ chatRoom: chatRoom, lastMessage: message.text }))
          }
          else {
            const newChatRoom = {
              chatRoomId: message.chatRoomId,
              id: message.senderId,
              avatar: activeChatRoom?.avatar,
              chatRoomName: message.senderName,
              lastMessage: message.text,
              unreadMessages: 1,
              online: false
            }
            const rooms = [...allChatRooms, newChatRoom]
            dispatch(setAllChatRooms(rooms))
            dispatch(setChatRooms(rooms))
            console.log(rooms)
          }

          dispatch(sortChatRooms(message))
        }
    });
  }, [allChatRooms]);

  // When user writing message
  useEffect(() => {
    connection.on("writing", (chatRoomId) => {
      const chatRoom = chatRooms.filter(c => c.chatRoomId == chatRoomId)[0]

      dispatch(setChatRoomLastMessage({ chatRoom, lastMessage:  "Печатает..." }))

      if (timerId.current) {
        clearTimeout(timerId.current);
      }
  
      // Запускаем новый таймер, который отправит запрос через 5 секунд
      timerId.current = setTimeout(() => {
        console.log(store.getState().messagesSlice.chatRooms.filter(c => c.chatRoomId == chatRoomId)[0].lastMessage)
        if (store.getState().messagesSlice.chatRooms.filter(c => c.chatRoomId == chatRoomId)[0].lastMessage == "Печатает...")
          dispatch(setChatRoomLastMessage({ chatRoom, lastMessage: chatRoom.lastMessage }))
      }, 3000);
    }) 
  })

  useEffect(() => {
    connection.on("create_chat", (chatRoom) => {
      console.log(chatRoom)
      const room = {
          chatRoomId: chatRoom.chatRoomId,
          id: "chatRoom.id",
          avatar: chatRoom.avatar,
          chatRoomName: chatRoom.chatRoomName,
          lastMessage: "Последнее сообщение",
          unreadMessages: 0,
          online: chatRoom.online
        }

        const rooms = [...allChatRooms, room]
        dispatch(setAllChatRooms(rooms))
        dispatch(setChatRooms(rooms))
    });
  }, [allChatRooms])

  const findUser = (userName: string) => {
        const config = {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        };
        axios.get(`http://localhost:5010/api/chats/findUser?userName=${userName}`, config)
        .then(e => {
          console.log(e.data)
          const room = {
            id: e.data.id,
            userName: e.data.userName,
            avatar: e.data.avatar,
            chatRoomId: e.data.chatRoomId ?? 0,
            chatRoomName: e.data.fullName,
            lastMessage: '',
            unreadMessages: 0,
            online: e.data.online
          }
          dispatch(addChatRoom(room))
        });
  };

  const setActiveChat = (chatRoom: ChatRoom) => {
    dispatch(setActiveChatRoom(chatRoom))
    //setActiveChatRoomIndex(chatRooms.indexOf(chatRooms.filter(c => c.chatRoomId == chatRoom.chatRoomId)[0]));
    dispatch(removeAllMessagesFromChat());
    dispatch(removeChatRoomsUnreadMessages(chatRoom));
  };

  const chatRoomIsExists = (chatRoom: ChatRoom) => store.getState().messagesSlice.allChatRooms.some(c => c.chatRoomId == chatRoom.chatRoomId);

  const chatAction = (chatRoom: ChatRoom) => {
    console.log(allChatRooms)
    console.log(store.getState().messagesSlice.allChatRooms)
    //if (chatRoomIsExists(chatRoom))
    setActiveChat(chatRoom)
    /*else
      createChat(chatRoom)*/
  }

    connection.on("online", (userId, online) => {
      console.log(online)
      dispatch(setChatRoomOnline({id: userId, online}))
    });
  
  return (
    <>
      <div className="chat-rooms"> 
        <div className='header'>
            <input onChange={e => searchChatRoom(e)} onKeyDown={e => search(e)} className='search-field' placeholder='Поиск чата'></input>
        </div>
        <div className='chatRooms'>
        {chatRooms.map((c, i) => 
            <div key={i} onClick={() => chatAction(c)} 
            className={activeChatRoom?.chatRoomId == c.chatRoomId 
            ? (c.unreadMessages > 0 ? 'user active unread' : 'user active') : (c.unreadMessages > 0 ? 'user unread' : 'user')}>
                <div className='avatar'>{c.avatar != null ? <div><img src={"http://localhost:5010/Assets/Images/" + c.avatar + "_medium.png"} /></div> : c.chatRoomName[0]}{c.online ? <span className='diod online'>•</span> : <span className="diod offline">•</span>}</div>
                <div className='info'>
                  <div className='name'>{c.unreadMessages > 0 ? c.chatRoomName.substring(0, 15) + "..." : c.chatRoomName}</div>
                  <div className='last-message'>
                    {c.lastMessage != "Печатает..." ? (c.lastMessage.length > 18 ? c.lastMessage.substring(0, 18) + "..." : c.lastMessage) : <span className='writing'>Печатает...</span>}
                    </div>
                </div>
                {c.unreadMessages > 0 ? <div className='unread-messages'>{c.unreadMessages}</div> : <></>}
            </div>
        )}
        </div>
        <ConnectionStatus></ConnectionStatus>
      </div>
    </>
  );
};

export default ChatRooms;
