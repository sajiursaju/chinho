import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 3,
  maxIdle: 2,
  idleTimeout: 30000,
  queueLimit: 0,
  decimalNumbers: true,
};

export const pool = mysql.createPool(dbConfig);