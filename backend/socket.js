import { Server } from "socket.io";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });
const accessSecretKey = process.env.ACCESS_SECRET;
export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    path: "/socket.io",
    cors: {
      origin: ["http://localhost:5173", "http://localhost:3000"],
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
      const user = jwt.verify(token, accessSecretKey);
      socket.data.user = { id: user.sub, email: user.email };
      next();
    } catch (e) {
      next(new Error("Auth error"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", (directId) => {
      socket.join(directId);
    });

    socket.on("chatMessage", ({ directId, meta, senderId }) => {
      io.to(directId).emit("chatMessage", {
        directId,
        meta,
        senderId,
      });
    });

    socket.on("disconnect", (reason) => {
      console.log("Disconnected", reason);
    });
  });

  return io;
}
