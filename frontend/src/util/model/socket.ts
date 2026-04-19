import { apiUrl } from "@/util/model/api";
import { io } from "socket.io-client";
export const socket = io(apiUrl, {
  path: "/socket.io",
  withCredentials: true,
  transports: ["websocket"],
  autoConnect: true,
});

