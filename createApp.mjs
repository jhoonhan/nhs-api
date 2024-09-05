import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import xss from "xss-clean";
import hpp from "hpp";
import compression from "compression";
import {expressjwt} from "express-jwt";
import {expressJwtSecret} from "jwks-rsa";
import appRouter from "./routes/index.mjs";

export const createApp = () => {
  const app = express();

  app.use(express.json());

// Enable All CORS Requests
  app.use(cors());
  app.options("*", cors());

  app.use(helmet());

  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

// Body parser, reading data from body into req.body
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Data sanitization against XSS
  app.use(xss());

// Prevent parameter pollution
  app.use(
    hpp({
      whitelist: ["all"],
    }),
  );

  app.use(compression());

// JWT Authorization
//   app.use(
//     expressjwt({
//       secret: expressJwtSecret({
//         jwksUri:
//           "https://login.microsoftonline.com/" +
//           process.env.TENANT_ID +
//           "/discovery/v2.0/keys",
//       }),
//       audience: process.env.API_SCOPE,
//       issuer: `https://sts.windows.net/${process.env.TENANT_ID}/`,
//       algorithms: ["RS256"],
//     }),
//   );

  app.use("/api/v1", appRouter);

  return app;
}