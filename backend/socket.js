import { Server } from "socket.io";
import * as cookie from "cookie";
import * as jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    path: "/socket.io",
    cors: {
      origin: ["http://localhost:5173"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const raw = socket.handshake.headers.cookie;
    const parsed = cookie.parse(raw);
    const token = parsed.accessToken;

    if (!token) return next(new Error("No auth token"));

    try {
      const user = jwt.verify(token, process.env.ACCESS_SECRET);
      socket.data.user = { id: user.sub, email: user.email };
      next();
    } catch (e) {
      next(new Error("Auth error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Authenticated: ", socket.data.user);

    socket.on("connection", (chatId) => {
      socket.join(chatId);
    });

    socket.on("send-message", ({ chatId, senderId, meta }) => {
      io.to(chatId).emit("message", {
        chatId,
        senderId,
        meta,
      });
    });

    socket.on("disconnect", (reason) => {
      console.log("Disconnected", reason);
    });
  });

  return io;
}
