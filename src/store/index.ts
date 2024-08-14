import { configureStore } from '@reduxjs/toolkit';

import testReducer from './testSlice';
import hubConnectionReducer from './hubConnectionSlice';
import messagesSlice, { addMessage } from './messagesSlice';
import userSlice from './userSlice';
 
const store = configureStore({
  reducer: {
    userSlice: userSlice,
    testSlice: testReducer,
    hubConnectionSlice: hubConnectionReducer,
    messagesSlice: messagesSlice
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;