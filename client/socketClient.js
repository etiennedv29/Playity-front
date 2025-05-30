// src/socket.js
import { io } from "socket.io-client";

const URL = "http://localhost:3000"; // à mettre à jour quand deploy
export const socket = io(URL, {
  autoConnect: false, // ← pour connecter manuellement,
  transports: ["websocket"],
  withCredentials: true,
});
