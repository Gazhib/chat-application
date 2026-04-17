const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost",
  "http://localhost:80",
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:80",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

const getAllowedOrigins = () => {
  const configuredOrigins = (process.env.FRONTEND_URLS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [...new Set([...DEFAULT_ALLOWED_ORIGINS, ...configuredOrigins])];
};

const createCorsOriginValidator = () => {
  const allowedOrigins = getAllowedOrigins();

  return (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  };
};

module.exports = { getAllowedOrigins, createCorsOriginValidator };
