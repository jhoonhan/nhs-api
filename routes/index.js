import express from "express";
import {
  createRequestHandler,
  createRequestByListHandler,
  getAllRequestsHandler,
  getRequestByShiftIdHandler,
  getRequestByRequestIdHandler,
  updateRequestHandler,
  deleteRequestHandler,
  getComputedRosterHandler,
  getAllUserHandler,
  updateShiftHandler,
  getRequestsByMonthYearHandler,
  loginHandler,
} from "../handlers/index.js";

const appRouter = express.Router();

appRouter.get("/request", getAllRequestsHandler);
// appRouter.get(
//   "/request-by-request/:shift_id/:user_id",
//   getRequestByRequestIdHandler,
// );
appRouter.get("/request-date/:month/:year", getRequestsByMonthYearHandler);
// appRouter.get("/request/:shift_id", getRequestByShiftIdHandler);

appRouter.post("/request/create-by-list", createRequestByListHandler);
// appRouter.put("/request-update", updateRequestHandler);

appRouter.get("/roster/:month/:year/:compute", getComputedRosterHandler);

appRouter.put("/shift-update", updateShiftHandler);

appRouter.get("/user", getAllUserHandler);
appRouter.post("/login", loginHandler);
// appRouter.get("/user/:user_id", getUserByIdHandler);
//
// appRouter.delete("/delete/:shift_id/:user_id", deleteRequestHandler);

export default appRouter;
