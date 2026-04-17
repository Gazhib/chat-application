const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const { callDisconnect } = require("./call");
require("dotenv").config({ path: "../.env" });

const accessSecretKey = process.env.ACCESS_SECRET;
const port = process.env.DF_PORT;

function initSocket(httpServer) {
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
    console.error("Socket.IO connection error:", err.code, err.message, err.context);
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
    } catch {
      next(new Error("Auth error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.user.id;
    let userCallRoom;

    onlineUsers[userId] = socket.id;
    io.emit("onlineList", { onlineUsersIds: Object.keys(onlineUsers) });

    socket.on("joinRoom", ({ chatId, companionId }) => {
      socket.join(chatId);
      if (companionId in onlineUsers) {
        const companionSocket = io.sockets.sockets.get(onlineUsers[companionId]);
        if (companionSocket) companionSocket.join(chatId);
      }
    });

    socket.on(
      "chatMessage",
      ({ chatId, cipher, senderId, _id, createdAt, picture, messageType, companionId, encVersion }) => {
        if (companionId in onlineUsers) {
          const companionSocket = io.sockets.sockets.get(onlineUsers[companionId]);
          if (companionSocket) companionSocket.join(chatId);
        }

        io.to(chatId).emit("chatMessage", {
          chatId,
          cipher,
          senderId,
          _id,
          createdAt,
          picture,
          messageType,
          encVersion: encVersion ?? 1,
          status: { delievered: 0, read: 0 },
        });
      }
    );

    socket.on("deleteMessage", ({ messageId, chatId }) => {
      io.to(chatId).emit("deleteMessage", { messageId });
    });

    socket.on("call", (callId) => {
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

    socket.on("hangUp", async () => {
      if (userCallRoom && rooms[userCallRoom]) {
        const companionId = rooms[userCallRoom].find((id) => id !== socket.id);
        delete rooms[userCallRoom];
        await callDisconnect(userCallRoom, userId);
        io.to(companionId).emit("userLeft");
      }
    });

    socket.on("disconnect", async () => {
      delete onlineUsers[userId];

      if (userCallRoom && rooms[userCallRoom]) {
        const companionId = rooms[userCallRoom].find((id) => id !== socket.id);
        delete rooms[userCallRoom];
        await callDisconnect(userCallRoom, userId);
        io.to(companionId).emit("userLeft");
      }

      io.emit("onlineList", { onlineUsersIds: Object.keys(onlineUsers) });
    });
  });

  return io;
}

module.exports = { initSocket };
