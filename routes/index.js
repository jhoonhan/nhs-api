import express from "express";
import {
  createRequestByListHandler,
  getAllRequestsHandler,
  getComputedRosterHandler,
  updateShiftHandler,
  getAllUserHandler,
  getUserByIdHandler,
  getRequestsByMonthYearHandler,
  loginHandler,
  inviteHandler,
  updateUserHandler,
  overrideCreateRequestByListHandler,
} from "../handlers/index.js";

const appRouter = express.Router();

appRouter.get("/request", getAllRequestsHandler);
appRouter.get("/request-date/:month/:year", getRequestsByMonthYearHandler);

appRouter.post("/request/create-by-list", createRequestByListHandler);
appRouter.post(
  "/request/create-by-list-override",
  overrideCreateRequestByListHandler,
);

appRouter.get("/roster/:month/:year/:compute", getComputedRosterHandler);

appRouter.put("/shift-update", updateShiftHandler);

appRouter.get("/user", getAllUserHandler);
appRouter.get("/user/:id_type/:user_id", getUserByIdHandler);
appRouter.put("/user", updateUserHandler);

appRouter.post("/login", loginHandler);
appRouter.post("/invite", inviteHandler);

export default appRouter;
