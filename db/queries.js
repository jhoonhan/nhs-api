import { pool } from "./index.js";

export const getAllRequest = async () => {
  const QUERY = "SELECT * FROM request";
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

export const getShiftById = async (shift_id) => {
  const QUERY = `SELECT * FROM shift 
                          WHERE shift_id = ${shift_id}
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

export const getShiftByRange = async (shift_id_start, shift_id_start_end) => {
  const QUERY = `SELECT * FROM shift 
                          WHERE shift_id BETWEEN ${shift_id_start} AND ${shift_id_start_end}
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

export const getShiftByMonthYear = async (month, year) => {
  const QUERY = `
        SELECT 
            shift.*, 
            day.day_id,
            day.day_num,
            week.week_id, 
            week.month, 
            week.year,
            week.week_start,
            week.week_end
        FROM (SELECT * FROM week WHERE year = ${year} AND month = ${month}) AS week
        JOIN day ON week.week_id = day.week_id
        JOIN shift ON day.day_id = shift.day_id
        ORDER BY shift.shift_id;
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
  const QUERY = `
        SELECT shift.*, request.*, schedule_priority.priority
        FROM (SELECT * FROM shift WHERE shift_id = ${shift_id}) AS shift
        JOIN (SELECT * FROM request WHERE shift_id = ${shift_id} ORDER BY priority_user DESC) AS request
        ON shift.shift_id = request.shift_id
        JOIN schedule_priority
        ON request.user_id = schedule_priority.user_id AND shift.priority_id = schedule_priority.priority_id
        ORDER BY request.priority_user DESC;
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

export const createRequest = async (
  shift_id,
  user_id,
  priority_user,
  p_computed,
) => {
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
      throw new Error("Record not found");
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

export const getComputedRequestByMonthYear = async (month, year) => {
  const QUERY = `
        SELECT 
            shift.shift_id, 
            day.day_id,
            day.day_num,
            week.week_id, 
            week.month, 
            week.year,
            week.week_start,
            week.week_end, 
            request.*, 
            schedule_priority.priority,
            shift.min_staff,
            shift.max_staff,
            shift.optimal_staff
        FROM (SELECT * FROM week WHERE year = ${year} AND month = ${month}) AS week
        JOIN day ON week.week_id = day.week_id
        JOIN shift ON day.day_id = shift.day_id
        JOIN request ON shift.shift_id = request.shift_id
        JOIN schedule_priority
        ON request.user_id = schedule_priority.user_id AND shift.priority_id = schedule_priority.priority_id
        ORDER BY request.priority_user DESC, schedule_priority.priority ASC;
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

export const getUserById = async (user_id) => {
  const QUERY = `SELECT * FROM user WHERE user_id = ${user_id}`;
  try {
    const client = await pool.getConnection();
    const res = await client.query(QUERY);
    return res;
  } catch (error) {
    console.error(`ERROR: ${error}`);
    throw error;
  }
};

export const getUserByList = async (user_id_list) => {
  const QUERY = `SELECT * FROM user WHERE user_id IN (${user_id_list.join(
    ",",
  )})`;
  try {
    const client = await pool.getConnection();
    const res = await client.query(QUERY);
    return res;
  } catch (error) {
    console.error(`ERROR: ${error}`);
    throw error;
  }
};
