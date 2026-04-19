const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const { callDisconnect } = require("./call");
const { createCorsOriginValidator } = require("./utils/origins");
require("dotenv").config({ path: "../.env" });

const accessSecretKey = process.env.ACCESS_SECRET;

function initSocket(httpServer) {
  const onlineUsers = {};
  const rooms = {};
  const pendingCalls = {};

  const io = new Server(httpServer, {
    path: "/socket.io",
    cors: {
      origin: createCorsOriginValidator(),
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
        const companionSocket = io.sockets.sockets.get(
          onlineUsers[companionId]
        );
        if (companionSocket) companionSocket.join(chatId);
      }
    });

    socket.on(
      "chatMessage",
      ({
        chatId,
        cipher,
        senderId,
        _id,
        createdAt,
        picture,
        messageType,
        companionId,
        encVersion,
        roomId,
      }) => {
        if (companionId in onlineUsers) {
          const companionSocket = io.sockets.sockets.get(
            onlineUsers[companionId]
          );
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
          roomId,
        });
      }
    );

    socket.on("deleteMessage", ({ messageId, chatId }) => {
      io.to(chatId).emit("deleteMessage", { messageId });
    });

    socket.on("call", (callId) => {
      const isNew = !rooms[callId]?.includes(socket.id);
      if (!isNew) return;
      rooms[callId] = (rooms[callId] ?? []).concat(socket.id);
      userCallRoom = callId;
      const otherUser = rooms[callId].find((id) => id !== socket.id);
      if (otherUser) {
        socket.emit("otherUser", otherUser);
        socket.to(otherUser).emit("userJoined", socket.id);
      }
    });

    socket.on("declineCall", ({ target }) =>
      io.to(target).emit("callDeclined")
    );

    socket.on("startCall", ({ calleeId, roomId }) => {
      pendingCalls[socket.id] = { calleeId, roomId };
    });

    socket.on("callAccepted", ({ callerId, roomId }) => {
      const callerSocketId = onlineUsers[callerId];
      if (callerSocketId) {
        io.to(callerSocketId).emit("callAccepted", { roomId });
        delete pendingCalls[callerSocketId];
      }
    });

    socket.on("cancelCall", async ({ calleeId }) => {
      const calleeSocketId = onlineUsers[calleeId];
      if (calleeSocketId) {
        io.to(calleeSocketId).emit("callCancelled");
      }
      const pending = pendingCalls[socket.id];
      if (pending) {
        await callDisconnect(pending.roomId, userId);
        delete pendingCalls[socket.id];
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

      const pending = pendingCalls[socket.id];
      if (pending) {
        const calleeSocketId = onlineUsers[pending.calleeId];
        if (calleeSocketId) io.to(calleeSocketId).emit("callCancelled");
        await callDisconnect(pending.roomId, userId);
        delete pendingCalls[socket.id];
      }

      io.emit("onlineList", { onlineUsersIds: Object.keys(onlineUsers) });
    });
  });

  return io;
}

module.exports = { initSocket };
