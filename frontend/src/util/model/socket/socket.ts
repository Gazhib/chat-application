import { io } from "socket.io-client";
import { port } from "../../ui/ProtectedRoutes";
export const socket = io(port, {
  path: "/socket.io",
  withCredentials: true,
  transports: ["websocket"],
  autoConnect: true,
});
