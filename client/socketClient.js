// src/socket.js
import { io } from "socket.io-client";

const URL = "http://localhost:3000"; // 🔁 À adapter à ton serveur
export const socket = io(URL, {
  autoConnect: false, // ← pour connecter manuellement
});
