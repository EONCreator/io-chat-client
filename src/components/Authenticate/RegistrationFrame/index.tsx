import React, { FC, useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { setAuthenticated, setFirstName, setLastName, setLogin, setToken, setUserId, setUserName } from '../../../store/userSlice';
import axios from 'axios';
import './styles.scss'
import AvatarMaker from './AvatarMaker'
import { environment } from '../../../settings';

interface RegistrationFrameProps {
  title: string;
}

const RegistrationFrame: FC<RegistrationFrameProps> = ({ title }) => {
  const token = useAppSelector(state => state.userSlice.token);
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(state => state.userSlice?.isAuthenticated);
  const [name, setName] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [firstName, setUserFirstName] = useState<string>();
  const [lastName, setUserLastName] = useState<string>();
  const [error, setError] = useState<string>("");

  const [usernameError, setUsernameError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [firstnameError, setFirstnameError] = useState<string>("");
  const [imageSrc, setImageSrc] = useState<string>("");

  const [usernameValid, setUsernameValid] = useState<boolean>(false);
  const [passwordValid, setPasswordValid] = useState<boolean>(false);
  const [firstnameValid, setFirstnameValid] = useState<boolean>(false);

  const [step, setStep] = useState<number>(1);

  const isValid = usernameValid && passwordValid && firstnameValid;

  const handleUserName = (e: any) => {
      setName(e.target.value)  
  };
  
  const validateUsername = () => {
    if (name?.length == 0) {
      setUsernameError("Имя пользователя не должно быть пустым")
      setFirstnameValid(false)
    }
    else {
      setUsernameError("")
      setFirstnameValid(true)
    }
  }

  const handlePassword = (e: any) => {
    setPassword(e.target.value)  
  };

  function validateString(input: string): boolean {
    const hasUpperCase = /[A-Z]/.test(input);
    const hasNumber = /\d/.test(input);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>[\]\\';'`~_-]/.test(input); // Добавлены все специальные символы
    
    return hasUpperCase && hasNumber && hasSpecialChar;
  }

  const validatePassword = () => {
    if (password?.length == 0) {
      setPasswordError("Пароль не может быть пустым")
      setPasswordValid(false)
    }
    else if (password!.length < 5) {
      setPasswordError("Пароль должен быть не менее 5 символов")
      setPasswordValid(false)
    }
    else if (!validateString(password!)) {
      setPasswordError("Пароль должен содержать хотя бы одну цифру, один заглавный символ, и хотя бы один специальный символ (например ! _ -)")
      setPasswordValid(false)
    }
    else {
      setPasswordError("")
      setPasswordValid(true)
    }
  }

  const handleUserFirstName = (e: any) => {
    setUserFirstName(e.target.value)  
  };

  const validateFirstname = () => {
    if (firstName?.length == 0) {
      setFirstnameError("Имя не может быть пустым")
      setFirstnameValid(false)
    }
    else {
      setFirstnameError("")
      setFirstnameValid(true)
    }
  }

  const handleUserLastName = (e: any) => {
    setUserLastName(e.target.value)  
  };

  const handleCreateUser = (e: any) => {
    if (e.nativeEvent.code == 'Enter') {
      createUser()
    }
  };

  const createUser = () => {
    axios.post(environment.apiUrl + "/api/users/create", { userName: name, password, firstName, lastName })
      .then((e) => {
        console.log(e.data)
        localStorage.setItem('access_token', e.data.accessToken)
        dispatch(setToken(e.data.accessToken))
        dispatch(setUserId(e.data.user.id))
        dispatch(setUserName(e.data.user.userName))
        dispatch(setFirstName(e.data.user.firstName))
        dispatch(setLastName(e.data.user.lastName))
        setError("")
        setStep(2)
        console.log(isAuthenticated)
    })
    .catch(e => { setError(e.response.data) })
  }
  
  return (
    <>
        {
          step == 1 
          ? <div className='login-frame' id="register">
            
            <div className='block'>
                <h3 className='title'>{title}</h3>
            </div>
            <div className='block'>
                <input className='text-box' 
                value={name}
                onChange={handleUserName} 
                onBlur={validateUsername}
                onKeyDown={handleCreateUser}
                placeholder='Введите ник пользователя'></input>
                <p><label className='error'>{usernameError}</label></p>
            </div>
            <div className='block' id="passwordBlock">
                <input className='text-box'
                value={password} 
                onChange={handlePassword} 
                onBlur={validatePassword}
                onKeyDown={handleCreateUser}
                type='password' 
                placeholder='Введите пароль'></input>
                <p><label className='error'>{passwordError}</label></p>
            </div>

            <div className='block'>
                <input className='text-box' 
                value={firstName}
                onChange={handleUserFirstName} 
                onBlur={validateFirstname}
                onKeyDown={handleCreateUser}
                placeholder='Введите имя'></input>
                <p><label className='error'>{firstnameError}</label></p>
            </div>
            <div className='block'>
                <input className='text-box' 
                value={lastName}
                onChange={handleUserLastName}
                onKeyDown={handleCreateUser} 
                placeholder='Введите фамилию'></input>
            </div>
            <div className='block'>
                <div className='remember-me'>
                    <input type='checkbox'></input>
                    <label>Запомнить меня</label>
                </div>
            </div>
            <div className='block'>
                <div className='submit-form'>
                    <button className='submit-button' onClick={createUser}>Регистрация</button>
                </div>
            </div>
            <label className='error'>{error}</label>
            <div className='block'>
                <div className='variants'>Уже есть аккаунт? <a onClick={() => dispatch(setLogin(true))}>Войти</a></div>
            </div>
            </div>
            
          : <div className='login-frame'>
              <AvatarMaker></AvatarMaker>
            </div>
        }
    </>
  );
};

export default RegistrationFrame;