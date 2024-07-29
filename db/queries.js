import { pool } from "./index.js";

let connection;

export const getAllRequest = async () => {
  const QUERY = "SELECT * FROM request";
  try {
    if (!connection) connection = await pool.getConnection();

    const res = await connection.query(QUERY);
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
    if (!connection) connection = await pool.getConnection();

    const res = await connection.query(QUERY);
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
    if (!connection) connection = await pool.getConnection();
    const res = await connection.query(QUERY);
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
    if (!connection) connection = await pool.getConnection();
    const res = await connection.query(QUERY);
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
    if (!connection) connection = await pool.getConnection();
    const res = await connection.query(QUERY);
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
    if (!connection) connection = await pool.getConnection();
    const res = await connection.query(QUERY);
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
    if (!connection) connection = await pool.getConnection();
    const res = await connection.query(QUERY);
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
                WHERE shift_id = ${shift_id} AND user_id = ${user_id}
                `;
  try {
    if (!connection) connection = await pool.getConnection();
    const res = await connection.query(QUERY);
    return res;
  } catch (error) {
    console.error(`ERROR: ${error}`);
    throw error;
  }
};

export const approveRequestByList = async (approvalList) => {
  // Updates request rows to "approved"
  const caseStatements = approvalList
    .map(
      ({ shift_id, user_id }) =>
        `WHEN shift_id = ${shift_id} AND user_id = ${user_id} THEN 'approved'`,
    )
    .join(" ");
  const UPDATE_QUERY = `
    UPDATE request
    SET status = CASE
      ${caseStatements}
      ELSE status
    END
    WHERE (shift_id, user_id) IN (${approvalList
      .map(({ shift_id, user_id }) => `(${shift_id}, ${user_id})`)
      .join(", ")})
  `;

  try {
    if (!connection) connection = await pool.getConnection();
    const resUpdate = await connection.query(UPDATE_QUERY);
    // const resInsert = await connection.query(INSERT_QUERY);
    return { updated: resUpdate[0] };
  } catch (error) {
    console.error(`ERROR: ${error}`);
    throw error;
  }
};

export const approveShiftByList = async (approvalList) => {
  // Updates request rows to "approved"
  const caseStatementsStatus = approvalList
    .map(({ shift_id }) => `WHEN shift_id = ${shift_id} THEN 'closed'`)
    .join(" ");

  const caseStatementsApprovedStaff = approvalList
    .map(
      ({ shift_id, approved_staff }) =>
        `WHEN shift_id = ${shift_id} THEN ${approved_staff}`,
    )
    .join(" ");

  const QUERY = `
    UPDATE shift
    SET status = CASE
      ${caseStatementsStatus}
      ELSE status
    END,
    approved_staff = CASE
      ${caseStatementsApprovedStaff}
      ELSE approved_staff
    END
    WHERE shift_id IN (${approvalList
      .map(({ shift_id }) => `${shift_id}`)
      .join(", ")})
  `;

  try {
    if (!connection) connection = await pool.getConnection();
    const res = await connection.query(QUERY);
    // const resInsert = await connection.query(INSERT_QUERY);
    return { updated: res[0] };
  } catch (error) {
    console.error(`ERROR: ${error}`);
    throw error;
  }
};

export const deleteRecord = async (shift_id, user_id) => {
  const QUERY = `
                  DELETE FROM request
                  WHERE shift_id = ${shift_id}
                    AND user_id = ${user_id}
                  `;
  try {
    if (!connection) connection = await pool.getConnection();
    const res = await connection.query(QUERY);

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
    if (!connection) connection = await pool.getConnection();

    const res = await connection.query(QUERY);
    return res;
  } catch (error) {
    console.error(`ERROR: ${error}`);
    throw error;
  }
};

export const getRequestsByMonthYear = async (month, year) => {
  // const QUERY = `
  //       SELECT
  //           shift.shift_id,
  //           day.day_id,
  //           day.day_num,
  //           week.week_id,
  //           week.month,
  //           week.year,
  //           week.week_start,
  //           week.week_end,
  //           request.*,
  //           schedule_priority.priority,
  //           shift.min_staff,
  //           shift.max_staff,
  //           shift.optimal_staff
  //       FROM (SELECT * FROM week WHERE year = ${year} AND month = ${month}) AS week
  //       JOIN day ON week.week_id = day.week_id
  //       JOIN shift ON day.day_id = shift.day_id
  //       JOIN request ON shift.shift_id = request.shift_id
  //       JOIN schedule_priority
  //       ON request.user_id = schedule_priority.user_id AND shift.priority_id = schedule_priority.priority_id
  //       ORDER BY request.priority_user DESC, schedule_priority.priority ASC;
  //   `;
  const QUERY = `
    SELECT *
    FROM (SELECT * FROM week WHERE year = ${year} AND month = ${month}) AS week
    JOIN day ON week.week_id = day.week_id
    JOIN shift ON day.day_id = shift.day_id
    JOIN request ON shift.shift_id = request.shift_id
    JOIN schedule_priority
    ON request.user_id = schedule_priority.user_id AND shift.priority_id = schedule_priority.priority_id
    JOIN user ON request.user_id = user.user_id
    JOIN nurse ON user.user_id = nurse.user_id
    ORDER BY request.priority_user DESC, schedule_priority.priority ASC;
  `;
  try {
    if (!connection) connection = await pool.getConnection();

    return await connection.query(QUERY);
  } catch (error) {
    console.error(`ERROR: ${error}`);
    throw error;
  }
};

export const getAllUser = async () => {
  const QUERY = "SELECT * FROM user JOIN nurse ON user.user_id = nurse.user_id";
  try {
    if (!connection) connection = await pool.getConnection();

    const res = await connection.query(QUERY);
    return res[0];
  } catch (error) {
    console.error(`ERROR: ${error}`);
    throw error;
  }
};
export const getUserById = async (user_id) => {
  const QUERY = `SELECT * FROM user WHERE user_id = ${user_id}`;
  try {
    if (!connection) connection = await pool.getConnection();

    const res = await connection.query(QUERY);
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
    if (!connection) connection = await pool.getConnection();

    const res = await connection.query(QUERY);
    return res;
  } catch (error) {
    console.error(`ERROR: ${error}`);
    throw error;
  }
};

export const resetRequest = async () => {
  const QUERY = `
        UPDATE request
        SET status = "pending"
        `;
  try {
    if (!connection) connection = await pool.getConnection();

    const res = await connection.query(QUERY);
    return res[0];
  } catch (error) {
    console.error(`ERROR: ${error}`);
    throw error;
  }
};
export const resetShift = async () => {
  const QUERY = `
        UPDATE shift
        SET status = "open", approved_staff = 0
        `;
  try {
    if (!connection) connection = await pool.getConnection();

    const res = await connection.query(QUERY);
    return res[0];
  } catch (error) {
    console.error(`ERROR: ${error}`);
    throw error;
  }
};

export const updateShift = async (shift_id, data) => {
  console.log(data);
  const setStatements = Object.entries(data)
    .map(([key, value]) => `${key} = '${value}'`)
    .join(", ");
  const QUERY = `UPDATE shift SET ${setStatements} WHERE shift_id = ${shift_id}`;
  try {
    if (!connection) connection = await pool.getConnection();
    const res = await connection.query(QUERY);
    return res[0];
  } catch (error) {
    console.error(`ERROR: ${error}`);
    throw error;
  }
};
