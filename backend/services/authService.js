const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { AppError } = require("../middleware/error");
const { userRepository } = require("../repositories");
const { transporter } = require("../mailer");
const { getPictureUrl } = require("./storageService");
const { trimmerCheck } = require("../utils/validation");
require("../loadEnv");

const accessSecretKey = process.env.ACCESS_SECRET;
const refreshSecretKey = process.env.REFRESH_SECRET;

const hashPassword = (password) => bcrypt.hash(password, 15);

const signAccessToken = (payload) =>
  jwt.sign(payload, accessSecretKey, { expiresIn: "1h" });

const signRefreshToken = (payload) =>
  jwt.sign(payload, refreshSecretKey, { expiresIn: "1w" });

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, refreshSecretKey);
  } catch {
    throw new AppError(401, "Invalid or expired token");
  }
};

const login = async ({ login, password }) => {
  if (!trimmerCheck(login)) {
    throw new AppError(400, "Login can not contain spaces");
  }
  if (!trimmerCheck(password)) {
    throw new AppError(400, "Password can not contain spaces");
  }
  if (login.trim().length === 0) {
    throw new AppError(400, "Login can not be empty");
  }
  if (password.trim().length === 0) {
    throw new AppError(400, "Password can not be empty");
  }

  const user = await userRepository.findByLogin(login);
  if (!user) throw new AppError(400, "No user with that login");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new AppError(401, "Incorrect password");

  const profilePicture = await getPictureUrl(user.profilePicture);

  return {
    login,
    role: "user",
    email: user.email,
    isVerified: user.isVerified,
    description: user.description,
    profilePicture,
    sub: user._id.toString(),
  };
};

const register = async ({ login, password, confirmPassword, email }) => {
  if (!trimmerCheck(login)) {
    throw new AppError(400, "Login can not contain spaces");
  }
  if (!trimmerCheck(password)) {
    throw new AppError(400, "Password can not contain spaces");
  }
  if (login.trim().length === 0) {
    throw new AppError(400, "Login can not be empty");
  }
  if (password.trim().length === 0) {
    throw new AppError(400, "Password can not be empty");
  }
  if (password !== confirmPassword) {
    throw new AppError(400, "Passwords do not match");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError(400, "Invalid email");
  }
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(login)) {
    throw new AppError(
      400,
      "Login length must be from 3 to 20 and no special characters"
    );
  }
  if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
    throw new AppError(
      400,
      "Password length is at least 8 characters, with at least 1 number and 1 letter"
    );
  }

  const [existingLogin, existingEmail] = await Promise.all([
    userRepository.findByLogin(login),
    userRepository.findByEmail(email),
  ]);

  if (existingLogin) {
    throw new AppError(400, "User with that login already exists");
  }
  if (existingEmail) {
    throw new AppError(400, "User with that Email already exists");
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expires = new Date(Date.now() + 15 * 60_000);
  const hashedPassword = await hashPassword(password);

  await userRepository.create({
    login,
    role: "USER",
    email,
    password: hashedPassword,
    verifyCode: code,
    verifyCodeExpires: expires,
  });

  await transporter.sendMail({
    to: email,
    subject: "Your verification code",
    text: `Your verification code is ${code}`,
  });
};

const verifyEmail = async ({ email, verifyCode }) => {
  const user = await userRepository.findByEmailAndCode(email, verifyCode);
  if (!user || user.verifyCodeExpires < new Date()) {
    if (user) await userRepository.deleteByEmail(email);
    throw new AppError(400, "Expired or invalid verification code");
  }

  await userRepository.updateById(user._id, {
    isVerified: true,
    verifyCode: undefined,
    verifyCodeExpires: undefined,
  });

  const profilePicture = await getPictureUrl(user.profilePicture);

  return {
    login: user.login,
    email,
    sub: user._id.toString(),
    role: "USER",
    description: user.description,
    profilePicture,
    isVerified: true,
  };
};

module.exports = {
  login,
  register,
  verifyEmail,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
};
