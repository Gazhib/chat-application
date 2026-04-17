const idsEqual = (left, right) => {
  if (left == null || right == null) return false;
  return left.toString() === right.toString();
};

const hasMembership = (chat, userId) =>
  chat?.membershipIds?.some((id) => idsEqual(id, userId)) ?? false;

module.exports = { idsEqual, hasMembership };
