import {pool} from './index.js';

export const getAllRequest = async () => {
    const QUERY = 'SELECT * FROM request';
    try {
        const client = await pool.getConnection();
        const res = await client.query(QUERY);
        return res[0];
    } catch (error) {
        console.error(`ERROR: ${error}`);
    }
};

export const getRequestById = async (shift_id, user_id) => {
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

export const getRequestByShiftId = async (shift_id) => {
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

export const createRequest = async (shift_id, user_id, priority_user, p_computed) => {
    const QUERY = `INSERT INTO request 
                (shift_id, user_id, priority_user, priority_computed) 
                VALUES (
                    ${shift_id}, 
                    ${user_id},
                    ${priority_user},
                    ${p_computed}
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


export const updateRequest = async (shift_id, user_id, status) => {
    const QUERY = `
                UPDATE request
                SET
                    status = '${status}'
                WHERE id = ${shift_id} AND user_id = ${user_id}
                `;
    try {
        const client = await pool.getConnection();
        const res = await client.query(QUERY);
        return res;
    } catch (error) {
        console.error(`ERROR: ${error}`);
    }
};

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


export const getPriorityIdByShiftId = async (shift_id) => {
    const QUERY = `
        SELECT * FROM schedule_priority 
        WHERE priority_id IN (
            SELECT priority_id 
            FROM shift 
            WHERE shift_id = ${shift_id}
        )
    `;
    try {
        const client = await pool.getConnection();
        const res = await client.query(QUERY);
        return res;
    } catch (error) {
        console.error(`ERROR: ${error}`);
        throw error;
    }
};