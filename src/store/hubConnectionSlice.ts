import { connect, ConnectedProps } from 'react-redux'
import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit"
import signalR, { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import connection from '../middlewares/signalrMiddleware';
import { useAppDispatch } from './hooks';
import axios from 'axios';

type HubConnectionState = {
  messages: Message[],
  connected: boolean,
  mobile: boolean;
}

const initialState: HubConnectionState = {
  messages: [],
  connected: false,
  mobile: false
};

const hubConnectionSlice = createSlice({
    name: 'hubConnectionSlice',
    initialState,
    reducers: {
      sendMessage(state, action: PayloadAction<MessageSendModel>) {
        //connection.invoke('SendMessage', action.payload.userToId, { text: action.payload.message.text, senderId: action.payload.message.senderId })
      },
      setConnected(state, action: PayloadAction<boolean>) {
        state.connected = action.payload
      },
      setMobile(state, action: PayloadAction<boolean>) {

      },
      resetTestState(state) {
        
      }
    }
  });
  
  export const {
    sendMessage,
    setConnected,
    resetTestState 
  } = hubConnectionSlice.actions;
  
  export default hubConnectionSlice.reducer;