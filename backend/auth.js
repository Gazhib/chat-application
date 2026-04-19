const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("./loadEnv");

const authRoutes = require("./routes/authRoutes");
const { errorHandler } = require("./middleware/error");
const { createCorsOriginValidator } = require("./utils/origins");

const app = express();

app.use(
  cors({
    origin: createCorsOriginValidator(),
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.use("/api", authRoutes);
app.use(errorHandler);

const port = process.env.AUTH_PORT;
app.listen(port, () => {
  console.log(`Auth server started at ${port}`);
});
