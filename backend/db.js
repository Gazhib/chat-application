const { Pool } = require("pg");
require("dotenv").config({ path: "../.env" });

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "decentra_password123",
  database: "chatenko",
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL client error", err);
});

module.exports = pool;
