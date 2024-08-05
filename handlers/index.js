import {
  getAllRequest,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRecord,
  getRequestByShiftId,
  createRequestByList,
  getUserById,
  getAllUser,
  getRequestsByMonthYear,
  updateShift,
  updateUser,
} from "../db/queries.js";

import jwt from "jsonwebtoken";

import { computeRoster } from "../scheduler/index.js";
import { pool } from "../db/index.js";

const PRIORITY_COMPUTED = 0;

export const getAllRequestsHandler = async (req, res) => {
  try {
    const requests = await getAllRequest();
    return res.status(200).json({ status: "success", data: requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "fail", message: "Server Error" });
  }
};

export const getRequestByRequestIdHandler = async (req, res) => {
  try {
    const shiftId = req.params.shift_id;
    const userId = req.params.user_id;
    const request = await getRequestById(shiftId, userId);
    return res.status(200).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "fail", message: "Server Error" });
  }
};

export const getRequestByShiftIdHandler = async (req, res) => {
  try {
    const shiftId = req.params.shift_id;
    const request = await getRequestByShiftId(shiftId);
    return res.status(200).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "fail", message: "Server Error" });
  }
};

export const createRequestHandler = async (req, res) => {
  const { shift_id, user_id, priority_user } = req.body;

  if (typeof shift_id !== "number" || typeof user_id !== "number") {
    return res.status(403).json({ message: "Input validation failed" });
  }

  try {
    const request = await createRequest(
      shift_id,
      user_id,
      priority_user,
      PRIORITY_COMPUTED,
    );
    return res.status(201).json({ status: "success", data: request });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "fail", message: error.message });
  }
};

export const createRequestByListHandler = async (req, res) => {
  try {
    const request = await createRequestByList(req.body);
    return res.status(201).json({ status: "success", data: request });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateRequestHandler = async (req, res) => {
  const { shift_id, user_id, status } = req.body;

  try {
    const request = await updateRequest(shift_id, user_id, status);

    return res.status(201).json({ request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteRequestHandler = async (req, res) => {
  try {
    const shiftId = req.params.shift_id;
    const userId = req.params.user_id;
    const request = await deleteRecord(shiftId, userId);
    return res.status(200).json({ status: "success", data: request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "fail", message: error.message });
  }
};

export const getRequestsByMonthYearHandler = async (req, res) => {
  try {
    const month = req.params.month;
    const year = req.params.year;
    const data = await getRequestsByMonthYear(month, year);

    return res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "fail", message: error.message });
  }
};

export const getComputedRosterHandler = async (req, res) => {
  try {
    const month = req.params.month;
    const year = req.params.year;
    const compute = +req.params.compute;
    const computedShift = await computeRoster(month, year, compute);

    return res.status(200).json({ status: "success", data: computedShift });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// USERS
export const getAllUserHandler = async (req, res) => {
  try {
    const decodedToken = jwt.decode(req.headers.authorization.split(" ")[1]);
    const requests = await getAllUser();
    // console.log(decodedToken);
    // context.res =
    //   decodedToken.scp.split(" ").indexOf("Greeting.Read") > -1
    //     ? {
    //         body: "Hello, world. You were able to access this because you provided a valid access token with the Greeting.Read scope as a claim.",
    //       }
    //     : { body: "Missing required scope.", status: 403 };

    return res.status(200).json({ status: "success", data: requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "fail", message: "Server Error" });
  }
};
export const getUserByIdHandler = async (req, res) => {
  try {
    const userId = req.params.user_id;
    const user = await getUserById(userId, "user_id");
    return res.status(200).json({ status: "success", data: user[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "fail", message: error.message });
  }
};

export const loginHandler = async (req, res) => {
  const { ms_id, firstname, lastname, email } = req.body;
  try {
    const user = await getUserById(email, "email");

    // If user was not added to db by the manager.
    if (!user[0]) {
      throw new Error("User does not exist. Contact your manager.");
    }

    // If existing user, end prematurely
    if (user[0].ms_id !== "0") {
      return res.status(200).json({ status: "success", data: user[0] });
    }

    // If new user
    await updateUser(user[0].user_id, ["ms_id", ms_id]);
    user[0].ms_id = ms_id;

    return res.status(200).json({ status: "success", data: user[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: "fail", message: e.message });
  }
};

// SHIFTS
export const updateShiftHandler = async (req, res) => {
  const { shift_id, data } = req.body;

  try {
    const request = await updateShift(shift_id, data);

    return res.status(201).json({ request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
