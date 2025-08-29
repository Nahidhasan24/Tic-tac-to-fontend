import { io, Socket } from "socket.io-client";

let socket: Socket;

export const getSocket = () => {
  if (!socket) {
    socket = io("https://tic-tac-to-backend.onrender.com");
    // socket = io("http://localhost:4000");
  }
  return socket;
};
