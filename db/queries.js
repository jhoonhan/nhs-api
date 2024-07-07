import { pool } from './index.js';

export const find = async () => {
  const QUERY = 'SELECT * FROM products';
  try {
    const client = await pool.getConnection();
    const res = await client.query(QUERY);
    return res;
  } catch (error) {
    console.error(`ERROR: ${error}`);
  }
};

export const findById = async (id) => {
  const QUERY = `SELECT * FROM products WHERE id = ?`;
  try {
    const client = await pool.getConnection();
    const res = await client.query(QUERY, [id]);
    return res;
  } catch (error) {
    console.error(`ERROR: ${error}`);
  }
};

export const create = async (title, description, price) => {
  const QUERY = `INSERT INTO products 
                (title, description, price) 
                VALUES (
                    '${title}', 
                    '${description}', 
                    ${price}
                )`;
  try {
    const client = await pool.getConnection();
    const res = await client.query(QUERY);
    return res;
  } catch (error) {
    console.error(`ERROR: ${error}`);
  }
};

export const update = async (title, description, price, id) => {
  const QUERY = `
                UPDATE products
                SET 
                    title = '${title}', 
                    description = '${description}', 
                    price = ${price}
                WHERE id = ${id}
                `;
  try {
    const client = await pool.getConnection();
    const res = await client.query(QUERY);
    return res;
  } catch (error) {
    console.error(`ERROR: ${error}`);
  }
};

export const deleteRecord = async (id) => {
  const QUERY = `
                  DELETE FROM products
                  WHERE id = ${id}
                  `;
  try {
    const client = await pool.getConnection();
    const res = await client.query(QUERY);
    return res;
  } catch (error) {
    console.error(`ERROR: ${error}`);
  }
};
