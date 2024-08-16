import express from "express";
import {
  createRequestByListHandler,
  getComputedRosterHandler,
  getAllUserHandler,
  getUserByIdHandler,
  loginHandler,
  inviteHandler,
  updateUserHandler,
} from "../handlers/index.js";

const appRouter = express.Router();

appRouter.post("/request/create-by-list/:override", createRequestByListHandler);

appRouter.get("/roster/:month/:year/:compute", getComputedRosterHandler);

appRouter.get("/user", getAllUserHandler);
appRouter.get("/user/:id_type/:user_id", getUserByIdHandler);
appRouter.put("/user", updateUserHandler);
appRouter.post("/user/login", loginHandler);
appRouter.post("/user/invite", inviteHandler);

export default appRouter;
