// db.js
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Function to test connection
const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("PostgreSQL Connected ✅");
    
    const res = await client.query("SELECT NOW()");
    console.log("Database Time:", res.rows[0].now);

    client.release();
  } catch (error) {
    console.error("Database Connection Failed ❌");
    console.error(error.message);
    process.exit(1); // Stop server if DB fails
  }
};

module.exports = { pool, connectDB };
