import express from "express";
import appRouter from "./routes/index.js";
import { connectToDatabase } from "./db/index.js";
import cors from "cors";

import { expressjwt } from "express-jwt";
import { expressJwtSecret } from "jwks-rsa";

const app = express();

// middlewares
app.use(express.json());

// Enable All CORS Requests
app.use(cors());

// 8-10 JWT Authorization
app.use(
  expressjwt({
    secret: expressJwtSecret({
      jwksUri:
        "https://login.microsoftonline.com/" +
        process.env.TENANT_ID +
        "/discovery/v2.0/keys",
    }),
    audience: process.env.API_SCOPE,
    issuer: `https://sts.windows.net/${process.env.TENANT_ID}/`,
    algorithms: ["RS256"],
  }),
);

app.use("/api/v1", appRouter);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});

connectToDatabase()
  .then(() => {
    console.log("Connected to database");
  })
  .catch((error) => {
    console.error("Failed to connect to database", error);
    server.close(() => {
      process.exit(0);
    });
  });

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  server.close(() => {
    process.exit(0);
  });
});
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});
process.on("SIGINT", () => {
  console.log("👋 SIGINT RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});
