const { asyncHandler } = require("../middleware/error");
const authService = require("../services/authService");

const cookieOpts = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
  maxAge: 3_600_000,
};

const setAccessCookie = (res, payload) => {
  res.cookie("accessToken", authService.signAccessToken(payload), cookieOpts);
};

const setRefreshCookie = (res, payload) => {
  res.cookie("refreshToken", authService.signRefreshToken(payload), cookieOpts);
};

const login = asyncHandler(async (req, res) => {
  const payload = await authService.login(req.body);
  setAccessCookie(res, payload);
  setRefreshCookie(res, payload);
  res.status(200).json("Logged in");
});

const registration = asyncHandler(async (req, res) => {
  await authService.register(req.body);
  res.status(201).json("Check your email for the code");
});

const verifyEmail = asyncHandler(async (req, res) => {
  const payload = await authService.verifyEmail(req.body);
  setAccessCookie(res, payload);
  setRefreshCookie(res, payload);
  res.status(200).json("Successfully registered");
});

const refresh = asyncHandler(async (req, res) => {
  const payload = authService.verifyRefreshToken(req.cookies.refreshToken);
  res.cookie("accessToken", "");
  delete payload.iat;
  delete payload.exp;
  setAccessCookie(res, payload);

  res.status(200).json({
    email: payload.email,
    isVerified: payload.isVerified,
    login: payload.login,
    role: payload.role,
    id: payload.sub,
  });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("refreshToken", cookieOpts);
  res.clearCookie("accessToken", cookieOpts);
  res.status(200).json("Logged out");
});

module.exports = { login, registration, verifyEmail, refresh, logout };
