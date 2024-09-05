import {createPool} from 'mysql2/promise';
import {config} from 'dotenv';

config();

const poolDev = createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE_NAME,
  port: process.env.MYSQL_PORT,
});

const poolProd = createPool({
  host: process.env.DB_PROD_HOST,
  user: process.env.DB_PROD_USER,
  password: process.env.DB_PROD_PASSWORD,
  database: process.env.MYSQL_DATABASE_NAME,
  port: process.env.MYSQL_PORT,
});

const connectToDatabase = async (env) => {
  try {
    env === 'dev' ? await poolDev.getConnection() : await poolProd.getConnection();
    console.log(`Connected to ${env} database`);
  } catch (error) {
    console.error('Failed to connect to database', error);
    throw error;
  }
};

const pool = process.env.NODE_ENV === 'production' ? poolProd : poolDev;

export {pool, connectToDatabase};
