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

export const findRequestById = async (shift_id, user_id) => {
    const QUERY = `SELECT * FROM request 
                          WHERE shift_id = ${shift_id}
                            AND user_id = ${user_id}
                          `;
    try {
        const client = await pool.getConnection();
        const res = await client.query(QUERY);
        return res[0];
    } catch (error) {
        console.error(`ERROR: ${error}`);
        throw error;
    }
};

export const findRequestByShift = async (shift_id) => {
    const QUERY = `SELECT * FROM request 
                          WHERE shift_id = ${shift_id}
                          ORDER BY priority_user DESC
                          `;
    try {
        const client = await pool.getConnection();
        const res = await client.query(QUERY);
        return res[0];
    } catch (error) {
        console.error(`ERROR: ${error}`);
        throw error;
    }
};

export const createRequest = async (shift_id, user_id, priority_user) => {
    const QUERY = `INSERT INTO request 
                (shift_id, user_id, priority_user) 
                VALUES (
                    ${shift_id}, 
                    ${user_id},
                    ${priority_user}
                )`;
    try {
        const client = await pool.getConnection();
        const res = await client.query(QUERY);
        return res;
    } catch (error) {
        console.error(`ERROR: ${error}`);
        throw error;
    }
};


// export const update = async (title, description, price, id) => {
//     const QUERY = `
//                 UPDATE request
//                 SET
//                     title = '${title}',
//                     description = '${description}',
//                     price = ${price}
//                 WHERE id = ${id}
//                 `;
//     try {
//         const client = await pool.getConnection();
//         const res = await client.query(QUERY);
//         return res;
//     } catch (error) {
//         console.error(`ERROR: ${error}`);
//     }
// };

export const deleteRecord = async (shift_id, user_id) => {
    const QUERY = `
                  DELETE FROM request
                  WHERE shift_id = ${shift_id}
                    AND user_id = ${user_id}
                  `;
    try {
        const client = await pool.getConnection();
        const res = await client.query(QUERY);

        if (!res[0].affectedRows) {
            throw new Error('Record not found');
        } else {
            return res;
        }
    } catch (error) {
        console.error(`ERROR: ${error}`);
        throw error;
    }
};
