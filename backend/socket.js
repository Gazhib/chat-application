import { Server } from "socket.io";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });
const accessSecretKey = process.env.ACCESS_SECRET;

const port = process.env.DF_PORT;

export function initSocket(httpServer) {
  const onlineUsers = {};

  const io = new Server(httpServer, {
    path: "/socket.io",
    cors: {
      origin: ["http://localhost:5173", `http://localhost:${port}`],
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket"],
    allowEIO3: true,
  });

  io.engine.on("connection_error", (err) => {
    console.error(
      "Socket.IO connection error:",
      err.code,
      err.message,
      err.context
    );
  });

  io.use((socket, next) => {
    const raw = socket.handshake.headers.cookie;
    if (!raw) return next(new Error("No auth cookie"));
    const parsed = cookie.parse(raw);
    const token = parsed.accessToken;

    if (!token) return next(new Error("No auth token"));
    try {
      if (accessSecretKey) {
        const user = jwt.verify(token, accessSecretKey);
        socket.data.user = { id: user.sub, email: user.email };
        next();
      }
    } catch (e) {
      next(new Error("Auth error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.user.id;
    onlineUsers[userId] = socket.id;
    io.emit("onlineList", { onlineUsersIds: Object.keys(onlineUsers) });

    socket.on("joinRoom", async ({ chatId, companionId }) => {
      socket.join(chatId);
      if (companionId in onlineUsers) {
        const companionSocketId = onlineUsers[companionId];
        const companionSocket = io.sockets.sockets.get(companionSocketId);
        if (companionSocket) {
          companionSocket.join(chatId);
          console.log("Joined the another room");
        }
      }
    });

    socket.on(
      "chatMessage",
      ({ chatId, cipher, senderId, _id, createdAt, picture }) => {
        console.log("handling message");
        io.to(chatId).emit("chatMessage", {
          chatId,
          cipher,
          senderId,
          _id,
          createdAt,
          picture,
        });
      }
    );

    socket.on("deleteMessage", ({ messageId, chatId }) => {
      io.to(chatId).emit("deleteMessage", {
        messageId,
      });
    });

    socket.on("disconnect", (reason) => {
      delete onlineUsers[userId];
      io.emit("onlineList", { onlineUsersIds: Object.keys(onlineUsers) });
    });
  });

  return io;
}
