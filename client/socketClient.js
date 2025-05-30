// src/socket.js
import { io } from "socket.io-client";

const URL = process.env.NEXT_PUBLIC_BACKEND_ADDRESS; // à mettre à jour quand deploy
export const socket = io(URL, {
  autoConnect: false, // ← pour connecter manuellement,
  transports: ["websocket"],
  withCredentials: true,
});
