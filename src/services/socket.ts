import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://10.188.44.69:5000", {
  transports: ["websocket"],
  autoConnect: true,
});

export default socket;