import * as signalR from "@microsoft/signalr";
import { useAppDispatch } from "../../store/hooks";
import { addMessage } from "../../store/messagesSlice";
import { useDispatch } from "react-redux";
import store from "../../store";
import axios from "axios";
import { environment } from "../../settings";

const connection = new signalR.HubConnectionBuilder()
   .withUrl(environment.apiUrl + "/chat", {
      withCredentials: false,
      accessTokenFactory: () => localStorage.getItem("access_token")!  
    })
   .build();


export default connection;