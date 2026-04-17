const PUBLIC_KEY_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const PUBLIC_KEY_RATE_LIMIT_MAX = 5;
const publicKeyUpdateAttempts = new Map();

const takePublicKeyUpdateSlot = (userId) => {
  const now = Date.now();
  const windowStart = now - PUBLIC_KEY_RATE_LIMIT_WINDOW_MS;
  const attempts = (publicKeyUpdateAttempts.get(userId) || []).filter(
    (ts) => ts > windowStart
  );
  if (attempts.length >= PUBLIC_KEY_RATE_LIMIT_MAX) {
    publicKeyUpdateAttempts.set(userId, attempts);
    return false;
  }
  attempts.push(now);
  publicKeyUpdateAttempts.set(userId, attempts);
  return true;
};

module.exports = { takePublicKeyUpdateSlot };
