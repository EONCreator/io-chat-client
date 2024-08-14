import React, { FC, useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { setAuthenticated, setAvatar, setFirstName, setLastName, setLogin, setToken, setUserId, setUserName } from '../../../store/userSlice';
import axios from 'axios';
import './styles.scss'
import store from '../../../store';

interface LoginFrameProps {
  title: string;
}

const LoginFrame: FC<LoginFrameProps> = ({ title }) => {
  const token = useAppSelector(state => state.userSlice.token);
  const dispatch = useAppDispatch();

  const [name, setName] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [error, setError] = useState<string>("");

  const handleUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)  
  };

  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)  
  };

  const authenticateFromInput = (e: any) => {
    if (e.nativeEvent.code == 'Enter') {
      authenticateUser()
    }
  };

  const authenticateUser = () => {
    axios.post("http://localhost:5010/api/users/authenticate", { userName: name, password })
      .then((e) => {
        localStorage.setItem('access_token', e.data.accessToken)
        dispatch(setToken(e.data.accessToken))
        dispatch(setAuthenticated(true))
        dispatch(setUserId(e.data.user.id))
        dispatch(setUserName(e.data.user.userName))
        dispatch(setFirstName(e.data.user.firstName))
        dispatch(setLastName(e.data.user.lastName))
        dispatch(setAvatar(e.data.user.avatar))
        setError("")
        console.log(e.data)
    }).catch(err => { setError(err.response.data) })
  }

  useEffect(() => {
    const inputUsername = document.querySelector('input[name="username"]') as HTMLInputElement;
    const inputPassword = document.querySelector('input[name="password"]') as HTMLInputElement;

    if (inputUsername) {
      setName(inputUsername.value);
    }
    if (inputPassword) {
      setPassword(inputPassword.value);
    }
  }, [])
  
  return (
    <>
        <div className='login-frame'>
            <div className='block'>
                <h3 className='title'>{title}</h3>
            </div>
            <div className='block'>
                <input 
                className='text-box' 
                name='username'
                onChange={handleUserName} 
                value={name} 
                onKeyDown={authenticateFromInput}
                placeholder='Введите имя'></input>
                <label className='error'></label>
            </div>
            <div className='block'>
                <input 
                className='text-box' 
                name='password'
                onChange={handlePassword} 
                value={password} 
                onKeyDown={authenticateFromInput}
                type='password' 
                placeholder='Введите пароль'></input>
                <label className='error'></label>
            </div>
            <div className='block'>
                <div className='remember-me'>
                    <input type='checkbox'></input>
                    <label>Запомнить меня</label>
                </div>
            </div>
            <div className='block'>
                <div className='submit-form'>
                    <button className='submit-button' onClick={authenticateUser}>Войти</button>
                </div>
            </div>
            <label className='error'>{error}</label>
            <div className='block'>
                <div className='variants'>Нет аккаунта? <a onClick={() => dispatch(setLogin(false))}>Зарегистрироваться</a></div>
            </div>
        </div>
    </>
  );
};

export default LoginFrame;