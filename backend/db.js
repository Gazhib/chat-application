const { Pool } = require("pg");
require("dotenv").config({ path: "../.env" });

const connectionString = process.env.PG_CONNECTION;

const pool = new Pool(
  connectionString
    ? { connectionString }
    : {
        host: process.env.PGHOST || "localhost",
        port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || "postgres",
        password: process.env.PGPASSWORD || "decentra_password123",
        database: process.env.PGDATABASE || "chatenko",
      }
);

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL client error", err);
});

module.exports = pool;
