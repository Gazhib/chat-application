const { asyncHandler } = require("../middleware/error");
const userService = require("../services/userService");

const listCompanions = asyncHandler(async (req, res) => {
  const userId = req.userPayload?.sub;
  const users = await userService.listCompanions(userId);
  res.status(200).json(users);
});

const searchUsers = asyncHandler(async (req, res) => {
  const { userName } = req.params;
  const users = await userService.searchUsers(userName);
  res.status(200).json(users);
});

const updateDescription = asyncHandler(async (req, res) => {
  const userId = req.userPayload.sub;
  const { description } = req.body;
  await userService.updateDescription(userId, description);
  res.status(200).json("Description changed successfully");
});

const updateProfilePicture = asyncHandler(async (req, res) => {
  const userId = req.userPayload.sub;
  const url = await userService.updateProfilePicture(userId, req.file);
  res.status(200).json({ profilePicture: url });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await userService.getCurrentUser(req.userPayload);
  res.status(200).json(user);
});

module.exports = {
  listCompanions,
  searchUsers,
  updateDescription,
  updateProfilePicture,
  getCurrentUser,
};
