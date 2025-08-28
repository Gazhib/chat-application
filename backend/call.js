import { callRoomModel, messageModel } from "./models.js";

export const callDisconnect = async (roomId, userId) => {
  const call = await callRoomModel.findOne({
    roomId,
    membershipIds: userId,
  });

  const message = await messageModel.findOne({ roomId });
  console.log("message:", message);
  console.log("roomId:", roomId);
  if (message) {
    message.finishedAt = new Date();
    await message.save();
  }
  if (call) await call.deleteOne();
};
