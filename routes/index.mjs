import express from "express";
import {
  createRequestByListHandler,
  getComputedRosterHandler,
  getAllUserHandler,
  getUserByIdHandler,
  loginHandler,
  inviteHandler,
  updateUserHandler,
} from "../handlers/index.mjs";

const appRouter = express.Router();

appRouter.get("/roster/:month/:year/:compute", getComputedRosterHandler);

appRouter.post("/request/:override", createRequestByListHandler);

appRouter.get("/user", getAllUserHandler);
appRouter.get("/user/:id_type/:user_id", getUserByIdHandler);
appRouter.put("/user", updateUserHandler);
appRouter.post("/user/login", loginHandler);
appRouter.post("/user/invite", inviteHandler);

export default appRouter;
