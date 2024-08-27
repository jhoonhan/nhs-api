import request from "supertest";
import express from "express";
import appRouter from "../routes/index.mjs";

let app;
let server;

beforeEach(() => {
  app = express();
  app.use(appRouter);
  server = app.listen(); // start the server
});

afterEach((done) => {
  server.close(done); // close the server after each test
});

describe("Test the root path", () => {
  test("It should response the GET method", async () => {
    const response = await request(app).get("/user");
    expect(response.statusCode).toBe(200);
  });
});

describe("Test user by id path", () => {
  test("It should response the GET method", async () => {
    const id_type = 1; // replace with your actual id_type
    const user_id = 1; // replace with your actual user_id
    const response = await request(app).get(`/user/${id_type}/${user_id}`);
    expect(response.statusCode).toBe(200);
  });
});

describe("Test roster path", () => {
  test("It should response the GET method", async () => {
    const response = await request(app).get("/roster/8/2024/0");
    expect(response.statusCode).toBe(200);
  });
});
