import React, { FunctionComponent, useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import * as signalR from "@microsoft/signalr";
import ChatWindow from './components/ChatWindow';
import { useAppDispatch, useAppSelector } from './store/hooks';
import connection from './middlewares/signalrMiddleware';
import { useDispatch } from 'react-redux';
import { addMessage } from './store/messagesSlice';
import Authenticate from './components/Authenticate';
import ChatRooms from './components/ChatRooms';
import axios from 'axios';
import { Beforeunload, useBeforeunload } from 'react-beforeunload';
import { setConnected } from './store/hubConnectionSlice';
import store from './store';

const App : FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(state => state.userSlice.isAuthenticated);
  const [firstConnect, setFirstConnect] = useState<boolean>(false);

  const showChatRooms = useAppSelector(state => state.messagesSlice.showChatRooms)
  const chatRoomShow = useAppSelector(state => state.messagesSlice.showChatRoom)

  const mobile = useAppSelector(state => state.hubConnectionSlice.mobile)
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const config = {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    };
    if (isAuthenticated) {
      connection.start().then(() => {
        console.log("SignalR connected!");
        

        /*axios.post(`http://localhost:5010/api/chats/notifyForOnline`, {}, config)
          .then((e) => {
              console.log(e)
          })*/
          dispatch(setConnected(true))
          setFirstConnect(true)
          
      }).catch(err => console.error(err));
    }
  }, [isAuthenticated]);

  connection.onclose(() => {
    dispatch(setConnected(false))
    for (let i = 0; i < 5; i++) {
      if (firstConnect && !store.getState().hubConnectionSlice.connected) {
        start()
      }
      else
        break;
    }
  })

  async function start() {
    try {
        if (firstConnect && !store.getState().hubConnectionSlice.connected) {
          await connection.start();
          dispatch(setConnected(true))
        }
    } catch (err) {
        console.log(err);
        setTimeout(start, 5000); // Попробуйте переподключиться через 5 секунд
    }
  }

  return (
    <div className="App">
      <div className='frame'>
        {isAuthenticated ?
        <div className='frame'>
          { width <= 400 ?
            
            (showChatRooms ? <ChatRooms></ChatRooms>
             : <ChatWindow></ChatWindow>  )
              : (<><ChatRooms></ChatRooms>
             <ChatWindow></ChatWindow></>)
          }
        </div>
        : <Authenticate title='Вход'></Authenticate>
        }
      </div>
    </div>
  );
}

export default App;
