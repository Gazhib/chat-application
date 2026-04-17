// Thin compatibility shim — delegates to the call service so existing
// imports (e.g. socket.js) continue to work without knowing the new layout.
const { disconnectCall } = require("./services/callService");

module.exports = { callDisconnect: disconnectCall };
