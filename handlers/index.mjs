import {
  getUserById,
  getAllUser,
  updateUser,
  createUser,
  overrideCreateRequestByList,
  createByList,
} from "../db/queries.mjs";

import axios from "axios";
import { ConfidentialClientApplication } from "@azure/msal-node";

import { computeRoster } from "../scheduler/index.mjs";

export const createRequestByListHandler = async (req, res) => {
  try {
    const override = +req.params.override === 1;
    const request = !override
      ? await createByList("request", req.body)
      : await overrideCreateRequestByList(req.body);
    return res.status(201).json({ status: "success", data: request });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getComputedRosterHandler = async (req, res) => {
  try {
    const month = req.params.month;
    const year = req.params.year;
    const compute = +req.params.compute;
    const computedShift = await computeRoster(month, year, compute);

    return res.status(200).json({ status: "success", data: computedShift });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// USERS
export const getAllUserHandler = async (req, res) => {
  try {
    const requests = await getAllUser();
    return res.status(200).json({ status: "success", data: requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "fail", message: "Server Error" });
  }
};

/** 8/5 Update
 * This function is used to get user by id, email, or ms_id.
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
export const getUserByIdHandler = async (req, res) => {
  try {
    let idType;
    switch (req.params.id_type) {
      case "0":
        idType = "user_id";
        break;
      case "1":
        idType = "ms_id";
        break;
      case "2":
        idType = "email";
        break;
      default:
        idType = "user_id";
    }
    const id = req.params.user_id;
    const user = await getUserById(id, idType);
    return res.status(200).json({ status: "success", data: user[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "fail", message: error.message });
  }
};

export const updateUserHandler = async (req, res) => {
  const data = req.body;
  try {
    await updateUser(data.user_id, data);
    return res.status(200).json({ status: "success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "fail", message: error.message });
  }
};

export const loginHandler = async (req, res) => {
  const { ms_id, firstname, lastname, email } = req.body;
  try {
    const userRes = await getUserById(email, "email");
    const user = userRes[0];

    // If user was not added to db by the manager.
    if (!user) {
      throw new Error("User does not exist. Contact your manager.");
    }

    // 8-10 Inactive user
    if (user.statue === "inactive") {
      throw new Error("User is inactive. Contact your manager.");
    }

    // If existing user, end prematurely
    if (user.ms_id !== "0") {
      return res.status(200).json({ status: "success", data: user });
    }

    // If new user
    await updateUser(user.user_id, {
      ...user,
      ms_id,
      status: "active",
      authority: 1,
    });
    user.ms_id = ms_id;

    return res.status(200).json({ status: "success", data: user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: "fail", message: e.message });
  }
};

// SHIFTS

const sendInvitation = async (email) => {
  try {
    const pca = new ConfidentialClientApplication({
      auth: {
        clientId: process.env.CLIENT_ID,
        authority: `https://login.microsoftonline.com/${process.env.TENANT_ID}`,
        clientSecret: process.env.CLIENT_SECRET,
      },
    });

    const accessTokenResponse = await pca.acquireTokenByClientCredential({
      scopes: ["https://graph.microsoft.com/.default"],
    });

    const invitation = {
      invitedUserEmailAddress: email,
      inviteRedirectUrl: process.env.REDIRECT_URI,
      sendInvitationMessage: true,
    };

    const response = await axios.post(
      "https://graph.microsoft.com/v1.0/invitations",
      invitation,
      {
        headers: {
          Authorization: `Bearer ${accessTokenResponse.accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.status !== 201) {
      throw new Error("Invitation failed");
    }

    return response.status === 201;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// 8-10 Invite user
export const inviteHandler = async (req, res) => {
  const { firstname, lastname, email, band, seniority } = req.body;
  try {
    // Search of user by email
    const userRes = await getUserById(email, "email");
    // Skip if user already exists and accepted the invitation
    if (userRes.length > 0 && userRes[0].ms_id !== "0") {
      return res.status(200).json({
        status: "success",
        message: "User already exists and accepted the invitation",
      });
    }
    // If no user found, create a new user record
    if (userRes.length === 0) {
      await createUser({
        firstname,
        lastname,
        email,
        band,
        seniority,
      });
    }
    // Invite user when there is no ms-id (have not logged in yet)
    if (userRes[0].ms_id === "0") {
      await sendInvitation(email);
    }
    return res.status(200).json({
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "fail", message: error.message });
  }
};
