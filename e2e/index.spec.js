import request from "supertest";
import { createApp } from "../createApp.mjs";
import { connectToDatabase } from "../db/index.mjs";

let app;

beforeAll(async () => {
  app = createApp();

  try {
    await connectToDatabase();
    console.log("Connected to database");
  } catch (error) {
    console.error("Failed to connect to database", error);
    process.exit(0);
  }
});

describe("GET /users", () => {
  it("should return 200 and an array of users", async () => {
    const response = await request(app).get("/user");
    expect(response.status).toBe(200);
    // expect(response.body).toEqual([]);
  });
});
