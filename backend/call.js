import { callRoomModel, messageModel } from "./models.js";

export const callDisconnect = async (roomId, userId) => {
  const call = await callRoomModel.findOne({
    roomId,
    membershipIds: userId,
  });

  const message = await messageModel.findOne({ roomId });
  if (message) {
    message.finishedAt = new Date();
    console.log(message);
    await message.save();
  }
  if (call) await call.deleteOne();
};
