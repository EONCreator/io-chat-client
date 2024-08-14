import { connect, ConnectedProps } from 'react-redux'
import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit"
import axios from 'axios';

type User = {
    isAuthenticated: boolean;
    login: boolean; // TODO поменять на router
    
    id: string | undefined;
    avatar: string | undefined;
    userName: string | undefined;
    token: string | undefined;

    firstName: string | undefined;
    lastName: string | undefined;
}

const initialState: User = {
    isAuthenticated: false,
    login: true,

    id: undefined,
    avatar: undefined,
    userName: undefined,
    token: undefined,

    firstName: undefined,
    lastName: undefined
};

const userSlice = createSlice({
    name: 'userSlice',
    initialState,
    reducers: {
        setToken(state, action: PayloadAction<string>) {
            state.token = action.payload
        },
        setAuthenticated(state, action: PayloadAction<boolean>) {
            state.isAuthenticated = action.payload
        },
        setAvatar(state, action: PayloadAction<string>) {
            state.avatar = action.payload
        },
        setUserId(state, action: PayloadAction<string>) {
            state.id = action.payload
        },
        setUserName(state, action: PayloadAction<string>) {
            state.userName = action.payload
        },
        setFirstName(state, action: PayloadAction<string>) {
            state.firstName = action.payload
        },
        setLastName(state, action: PayloadAction<string>) {
            state.lastName = action.payload
        },
        setLogin(state, action: PayloadAction<boolean>) {
            state.login = action.payload
        },
        resetTestState(state) {
            state.userName = undefined
            state.token = undefined
        }
    }
});
  
export const {
    setToken,
    setAuthenticated,
    setAvatar,
    setUserId,
    setUserName,
    setFirstName,
    setLastName,
    setLogin,
    resetTestState 
} = userSlice.actions;
  
  export default userSlice.reducer;