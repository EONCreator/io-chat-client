import React, { FC, useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setAuthenticated, setAvatar, setFirstName, setLastName, setToken, setUserId, setUserName } from '../../store/userSlice';
import axios from 'axios';
import LoginFrame from './LoginFrame';
import RegistrationFrame from './RegistrationFrame';
import './styles.scss'
import { environment } from '../../settings';

interface AuthenticateProps {
  title: string;
}

const Authenticate: FC<AuthenticateProps> = ({ title }) => {
  const isAuthenticated = useAppSelector(state => state.userSlice?.isAuthenticated);
  const token = useAppSelector(state => state.userSlice.token);
  const login = useAppSelector(state => state.userSlice.login);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    const getUser = () => {
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      };
      axios.get(environment.apiUrl + "/api/users/getCurrentUser", config)
      .then(e => {
        console.log(e.data)
        const user = e.data.user
        if (user){
        dispatch(setAuthenticated(true))
        dispatch(setAvatar(user.avatar))
        dispatch(setUserId(user.id))
        dispatch(setUserName(user.userName))
        dispatch(setFirstName(user.firstName))
        dispatch(setLastName(user.lastName))
        }
      });
    }

    if (token != null)
      getUser();
  }, []);

  
  return (
    <>
      {
        !isAuthenticated ?
        <div className='authenticate'>
          { 
            login 
              ? <LoginFrame title={'Вход'}></LoginFrame> 
              : <RegistrationFrame title={'Регистрация'}></RegistrationFrame>
          }
        </div> : <></>
      }
    </>
  );
};

export default Authenticate;