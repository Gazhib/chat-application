const BASE64_REGEX = /^[A-Za-z0-9+/]+=*$/;

const isBase64String = (value) =>
  typeof value === "string" && BASE64_REGEX.test(value);

const trimmerCheck = (word) => word.trim() === word;

const clamp = (value, min, max) =>
  Math.max(min, Math.min(Number(value) || min, max));

module.exports = { isBase64String, trimmerCheck, clamp };
