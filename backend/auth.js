const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config({ path: "../.env" });

const authRoutes = require("./routes/authRoutes");
const { errorHandler } = require("./middleware/error");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      `${process.env.DF_PORT}`,
    ],
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
