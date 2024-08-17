import { FC } from "react"

import './styles.scss'
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { environment } from "../../../../settings";
import { setSelectedSearchedMessage } from "../../../../store/messagesSlice";

interface ListOfSearchedMessagesProps {
    
}

const ListOfSearchedMessages: FC<ListOfSearchedMessagesProps> = () => {
    const connected = useAppSelector(state => state.hubConnectionSlice.connected);

    const activeChatRoom = useAppSelector(state => state.messagesSlice.activeChatRoom)
    const searchedMessages = useAppSelector(state => state.messagesSlice.searchedMessages)

    const dispatch = useAppDispatch();

    const showMessageInChat = (message: Message) => {
        console.log(message)
        dispatch(setSelectedSearchedMessage(message))
        
        const messagesList = document.getElementById('messageList')!
        const messageElement = document.getElementById("message_" + message.id)!
        const y = messageElement.offsetTop - messagesList.offsetTop;

        messagesList.scroll({
            top: y,
            behavior: 'auto'
        });
    }

    return (
        <div className="searchedMessages">
            {searchedMessages.length > 0 ? <div className="count">Найдено {searchedMessages.length} сообщений</div> : <></>}
            {searchedMessages.length > 0 ? <div>
                {searchedMessages.map((m, i) => 
                    <div key={i} onClick={() => showMessageInChat(m)}  className="user">
                        <div className='avatar'>{m.senderAvatar != null ? <div><img src={environment.apiUrl + "/Assets/Images/" + m.senderAvatar + "_medium.png"} /></div> : m.senderName![0]}</div>
                        <div className='info'>
                            <div className='name'>{m.senderName}</div>
                            <div className='last-message'>{m.text.length > 23 ? m.text.substring(0, 23) + "..." : m.text}</div>
                    </div>
                </div>
        )}
            </div> 
        : 
            <div className="empty">
                <center><div className="icon"><img src='./search.webp'></img></div></center>
                <div className="label">Поиск сообщений</div>
            </div>
            }
        </div>
    )
}

export default ListOfSearchedMessages