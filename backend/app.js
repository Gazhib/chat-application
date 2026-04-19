const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
require("./loadEnv");

const { initSocket } = require("./socket");
const routes = require("./routes");
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
app.use(express.json({ limit: "1mb" }));

app.use("/", routes);
app.use(errorHandler);

const server = http.createServer(app);
initSocket(server);

const port = process.env.DF_PORT;
server.listen(port, () => {
  console.log(`server started at ${port}`);
});
