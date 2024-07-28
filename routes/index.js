import express from "express";
import {
  createRequestHandler,
  getAllRequestsHandler,
  getRequestByShiftIdHandler,
  getRequestByRequestIdHandler,
  updateRequestHandler,
  deleteRequestHandler,
  getComputedRosterHandler,
  getUserByIdHandler,
  getAllUserHandler,
  updateShiftHandler,
} from "../handlers/index.js";

const appRouter = express.Router();

appRouter.get("/request", getAllRequestsHandler);
// appRouter.get(
//   "/request-by-request/:shift_id/:user_id",
//   getRequestByRequestIdHandler,
// );
// appRouter.get("/request-by-shift/:shift_id", getRequestByShiftIdHandler);
// appRouter.get("/request/:shift_id", getRequestByShiftIdHandler);

// appRouter.post("/request-create", createRequestHandler);
// appRouter.put("/request-update", updateRequestHandler);

appRouter.get("/roster/:month/:year/:compute", getComputedRosterHandler);

appRouter.put("/shift-update", updateShiftHandler);

appRouter.get("/user", getAllUserHandler);
// appRouter.get("/user/:user_id", getUserByIdHandler);
//
// appRouter.delete("/delete/:shift_id/:user_id", deleteRequestHandler);

export default appRouter;
