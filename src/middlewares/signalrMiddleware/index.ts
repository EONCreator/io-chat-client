import * as signalR from "@microsoft/signalr";
import { useAppDispatch } from "../../store/hooks";
import { addMessage } from "../../store/messagesSlice";
import { useDispatch } from "react-redux";
import store from "../../store";
import axios from "axios";

const connection = new signalR.HubConnectionBuilder()
   .withUrl("http://localhost:5010/chat", {
      accessTokenFactory: () => localStorage.getItem("access_token")!  
    })
   .build();


export default connection;