import { port } from "@/util/ui/ProtectedRoutes";
import { io } from "socket.io-client";
export const socket = io(port, {
  path: "/socket.io",
  withCredentials: true,
  transports: ["websocket"],
  autoConnect: true,
});
