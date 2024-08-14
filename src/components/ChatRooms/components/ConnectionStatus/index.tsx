import { FC } from "react"

import './styles.scss'
import { useAppSelector } from "../../../../store/hooks";

interface ConnectionStatusProps {
    
}

const ConnectionStatus: FC<ConnectionStatusProps> = () => {
    const connected = useAppSelector(state => state.hubConnectionSlice.connected);

    return (
        <div className="connection-status">
            {
                !connected
                ? <div className="text"><img className="loading" src='./loading4.gif'></img> Подключение</div>
                : <div className="text connected-text">Подключено</div>
            }
            <div className={"background " + (connected ? "connected" : "connecting")}></div>
        </div>
    )
}

export default ConnectionStatus