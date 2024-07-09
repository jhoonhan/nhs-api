import {pool} from './index.js';

export const find = async () => {
    const QUERY = 'SELECT * FROM request';
    try {
        const client = await pool.getConnection();
        const res = await client.query(QUERY);
        return res[0];
    } catch (error) {
        console.error(`ERROR: ${error}`);
    }
};

export const findById = async (id) => {
    const QUERY = `SELECT * FROM request WHERE request_id = ?`;
    try {
        const client = await pool.getConnection();
        const res = await client.query(QUERY, [id]);
        return res[0];
    } catch (error) {
        console.error(`ERROR: ${error}`);
    }
};

export const create = async (shift_id, user_id) => {
    const QUERY = `INSERT INTO request 
                (title, description, price) 
                VALUES (
                    ${shift_id}, 
                    ${user_id}
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
                UPDATE request
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
                  DELETE FROM requests
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
