import {
  createRequestByListHandler,
  getComputedRosterHandler,
  getAllUserHandler,
  getUserByIdHandler,
  updateUserHandler,
  loginHandler,
  inviteHandler,
  sendInvitation,
} from "../handlers/index.mjs";
import {
  getUserById,
  getAllUser,
  updateUser,
  createUser,
  overrideCreateRequestByList,
  createByList,
} from "../db/queries.mjs";

import { computeRoster } from "../scheduler/index.mjs";

jest.mock("../db/queries.mjs");

// Test for createRequestByListHandler
describe("createRequestByListHandler", () => {
  it("should create a request by list", async () => {
    const mockRequest = { id: 1, name: "Test Request" };
    createByList.mockResolvedValue(mockRequest);

    const req = {
      params: { override: "0" },
      body: { id: 1, name: "Test Request" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createRequestByListHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: mockRequest,
    });
  });
});

// // Test for getComputedRosterHandler
// describe("getComputedRosterHandler", () => {
//   it("should get computed roster", async () => {
//     const mockRoster = { id: 1, name: "Test Roster" };
//     computeRoster.mockResolvedValue(mockRoster);
//
//     const req = {
//       params: { month: "1", year: "2022", compute: "1" },
//     };
//
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };
//
//     await getComputedRosterHandler(req, res);
//
//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       status: "success",
//       data: mockRoster,
//     });
//   });
// });

// Test for getAllUserHandler
describe("getAllUserHandler", () => {
  it("should get all users", async () => {
    const mockUsers = [{ id: 1, name: "Test User" }];
    getAllUser.mockResolvedValue(mockUsers);

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getAllUserHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: mockUsers,
    });
  });
});

// Test for getUserByIdHandler
describe("getUserByIdHandler", () => {
  it("should get user by id", async () => {
    const mockUser = [{ id: 1, name: "Test User" }];
    getUserById.mockResolvedValue(mockUser);

    const req = {
      params: { id_type: "0", user_id: "1" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getUserByIdHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: mockUser[0],
    });
  });
});

// Test for updateUserHandler
describe("updateUserHandler", () => {
  it("should update a user", async () => {
    updateUser.mockResolvedValue();

    const req = {
      body: { user_id: "1", name: "Updated User" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateUserHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: "success" });
  });
});

// Test for loginHandler
describe("loginHandler", () => {
  it("should login a user", async () => {
    const mockUser = { ms_id: "0", name: "Test User" };
    getUserById.mockResolvedValue([mockUser]);
    updateUser.mockResolvedValue();

    const req = {
      body: {
        ms_id: "1",
        firstname: "Test",
        lastname: "User",
        email: "test@example.com",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await loginHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: { ...mockUser, ms_id: "1" },
    });
  });
});
