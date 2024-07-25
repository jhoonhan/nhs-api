import {
  getAllRequest,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRecord,
  getRequestByShiftId,
  getUserById,
} from "../db/queries.js";

import { computeShift } from "../scheduler/index.js";
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

export const getComputedShiftHandler = async (req, res) => {
  try {
    const month = req.params.month;
    const year = req.params.year;
    const computedShift = await computeShift(month, year);

    return res.status(200).json({ status: "success", data: computedShift });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "fail", message: error.message });
  }
};

export const getUserByIdHandler = async (req, res) => {
  try {
    const userId = req.params.user_id;
    const user = await getUserById(userId);
    return res.status(200).json({ status: "success", data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "fail", message: error.message });
  }
};
