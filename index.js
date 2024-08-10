import express from "express";
import appRouter from "./routes/index.js";
import { connectToDatabase } from "./db/index.js";
import cors from "cors";

import { expressjwt } from "express-jwt";
import { expressJwtSecret, JwksClient } from "jwks-rsa";
import jwtAuthz from "express-jwt-authz";

const app = express();

// middlewares
app.use(express.json());

// Enable All CORS Requests
app.use(cors());

// Add Express middleware to validate JWT access tokens
// app.use((req, res, next) => {
//   if (!req.headers.authorization) {
//     return res
//       .status(401)
//       .send({ status: "fail", message: "No Authorization Header" });
//   }
//   const decodedToken = jwt.decode(req.headers.authorization.split(" ")[1]);
//   if (!decodedToken) {
//     return res.status(401).send({ status: "fail", message: "Invalid Token" });
//   } else {
//     next();
//   }
// });

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
