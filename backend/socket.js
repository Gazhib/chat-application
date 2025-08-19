import { Server } from "socket.io";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { callDisconnect } from "./call.js";

dotenv.config({ path: "../.env" });
const accessSecretKey = process.env.ACCESS_SECRET;

const port = process.env.DF_PORT;

export function initSocket(httpServer) {
  const onlineUsers = {};
  const rooms = {};
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
    let userCallRoom;
    onlineUsers[userId] = socket.id;
    io.emit("onlineList", { onlineUsersIds: Object.keys(onlineUsers) });

    socket.on("joinRoom", async ({ chatId, companionId }) => {
      socket.join(chatId);
      if (companionId in onlineUsers) {
        const companionSocketId = onlineUsers[companionId];
        const companionSocket = io.sockets.sockets.get(companionSocketId);
        if (companionSocket) {
          companionSocket.join(chatId);
        }
      }
    });

    socket.on(
      "chatMessage",
      ({ chatId, cipher, senderId, _id, createdAt, picture, messageType }) => {
        console.log("handling message", messageType);
        io.to(chatId).emit("chatMessage", {
          chatId,
          cipher,
          senderId,
          _id,
          createdAt,
          picture,
          messageType,
        });
      }
    );

    socket.on("deleteMessage", ({ messageId, chatId }) => {
      io.to(chatId).emit("deleteMessage", {
        messageId,
      });
    });

    // add to a database soon
    socket.on("call", (callId) => {
      console.log("rooms: ", rooms);
      if (rooms[callId]) {
        if (!rooms[callId].includes(socket.id)) rooms[callId].push(socket.id);
      } else {
        rooms[callId] = [socket.id];
      }
      const otherUser = rooms[callId].find((id) => id !== socket.id);
      userCallRoom = callId;
      if (otherUser) {
        socket.emit("otherUser", otherUser);
        socket.to(otherUser).emit("userJoined", socket.id);
      }
    });

    socket.on("offer", (payload) => {
      io.to(payload.target).emit("offer", payload);
    });

    socket.on("answer", (payload) => {
      io.to(payload.target).emit("answer", payload);
    });

    socket.on("ice-candidate", (incoming) => {
      io.to(incoming.target).emit("ice-candidate", incoming.candidate);
    });

    socket.on("hangUp", () => {
      if (userCallRoom && rooms[userCallRoom]) {
        const companionId = rooms[userCallRoom].find((id) => id !== socket.id);
        delete rooms[userCallRoom];
        io.to(companionId).emit("userLeft");
      }
    });

    socket.on("disconnect", async (reason) => {
      delete onlineUsers[userId];
      if (userCallRoom) {
        if (rooms[userCallRoom]) {
          const companionId = rooms[userCallRoom].find(
            (id) => id !== socket.id
          );
          delete rooms[userCallRoom];

          await callDisconnect(userCallRoom, userId);
          io.to(companionId).emit("userLeft");
        }
      }
      console.log("disconnected:", rooms);

      io.emit("onlineList", { onlineUsersIds: Object.keys(onlineUsers) });
    });
  });

  return io;
}
