const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "../.env" });

const accessSecretKey = process.env.ACCESS_SECRET;

const tokenMiddleware = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Invalid Token");

  jwt.verify(token, accessSecretKey, (err, userPayload) => {
    if (err) {
      console.error(err);
      return res.status(401).json("Invalid or expired token");
    }
    req.userPayload = userPayload;
    next();
  });
};

module.exports = { tokenMiddleware };
