const {
  userQueries,
  chatQueries,
  messageQueries,
  callRoomQueries,
} = require("../models");

module.exports = {
  userRepository: userQueries,
  chatRepository: chatQueries,
  messageRepository: messageQueries,
  callRoomRepository: callRoomQueries,
};
