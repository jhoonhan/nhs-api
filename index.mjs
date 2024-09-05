import {connectToDatabase} from "./db/index.mjs";
import {createApp} from "./createApp.mjs";

const app = createApp();

const PORT = process.env.PORT || 5001;


const server = app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});

connectToDatabase(process.env.NODE_ENV)
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
