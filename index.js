import express from "express";
import appRouter from "./routes/index.js";
import { connectToDatabase } from "./db/index.js";
import cors from "cors";

import { expressjwt } from "express-jwt";
import { expressJwtSecret } from "jwks-rsa";
import jwtAuthz from "express-jwt-authz";

const config = {
  auth: {
    // 'Directory (tenant) ID' of app registration in the Microsoft Entra admin center - this value is a GUID
    tenant: "f5ebf3d1-9216-4ea3-94fc-cd4ffde6898a",

    // 'Application (client) ID' of app registration in the Microsoft Entra admin center - this value is a GUID
    audience: "69633545-10c6-4412-b2dc-f395d7eaded7",
  },
};

const app = express();

// middlewares
app.use(express.json());

// Enable All CORS Requests
app.use(cors());

// Add Express middleware to validate JWT access tokens
app.use(
  expressjwt({
    secret: expressJwtSecret({
      jwksUri:
        "https://login.microsoftonline.com/" +
        config.auth.tenant +
        "/discovery/v2.0/keys",
    }),
    audience: config.auth.audience,
    issuer: "https://login.microsoftonline.com/" + config.auth.tenant + "/v2.0",
    algorithms: ["RS256"],
  }),
);

// Verify the JWT access token is valid and contains 'Greeting.Read' for the scope to access the endpoint.
// Instruct jwtAuthz to pull scopes from the 'scp' claim, which is the claim used by Azure AD.
app.get(
  "/",
  jwtAuthz(["Greeting.Read"], { customScopeKey: "scp" }),
  (req, res) => {
    res.send(
      "Hello, world. You were able to access this because you provided a valid access token with the Greeting.Read scope as a claim.",
    );
  },
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
