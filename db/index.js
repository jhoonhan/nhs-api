import { createPool } from 'mysql2/promise';
import { config } from 'dotenv';

config();

const pool = createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE_NAME,
  port: process.env.MYSQL_PORT,
});

const connectToDatabase = async () => {
  try {
    await pool.getConnection();
    console.log('Connected to database');
  } catch (error) {
    console.error('Failed to connect to database', error);
    throw error;
  }
};

export { pool, connectToDatabase };
