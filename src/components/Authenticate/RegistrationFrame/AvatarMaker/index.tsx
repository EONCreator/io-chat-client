import React, { FC, useEffect, useState } from 'react';
import Avatar from 'react-avatar-edit'
import axios from 'axios'

import { useAppSelector, useAppDispatch } from './../../../../store/hooks';
import { setAuthenticated, setAvatar } from './../../../../store/userSlice';

import './styles.scss'

interface AvatarMakerProps {
    
}  

const AvatarMaker: FC<AvatarMakerProps> = () => {
    const [imageSrc, setImageSrc] = useState<string>("");
    const [preview, setPreview] = useState<string>("");

    const [error, setError] = useState<string>("");

    const dispatch = useAppDispatch();

    const onCrop = (preview: string) => {
        setPreview(preview)
    };

    const handleSetAvatar = () => {
          setUserAvatar(preview)
    };
    
      const setUserAvatar = (preview: string) => {
        const config = {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        };

        axios.post("http://localhost:5010/api/users/setAvatar", { base64EncodedImage: preview }, config)
          .then((e) => {
            dispatch(setAuthenticated(true))
            dispatch(setAvatar(e.data.avatar))
        }).catch(err => { setError(err.response.data) })
      }

    return (
        <>
        <div>
            <div className='title'><label>Фото профиля</label></div>
            <div className='image-preview'>
                <div className='preview'>{preview.length != 0 ? <img className="preview" src={preview} /> : <></>}</div>
            </div>
            <div className='image-cropper'>
                <Avatar 
                    label="Загрузите изображение"
                    src={imageSrc}
                    onCrop={onCrop}
                    width={390}
                    height={295}></Avatar>
            </div>
            <div className='actions'>
                <button className='action-button skip' onClick={() => dispatch(setAuthenticated(true))}>Пропустить</button>
                <button className='action-button accept' onClick={handleSetAvatar}>Принять</button>
            </div>
        </div>
        </>
    )
}

export default AvatarMaker