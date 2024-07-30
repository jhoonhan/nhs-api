import {
  getAllRequest,
  getRequestById,
  getShiftByRange,
  getShiftByMonthYear,
  createRequest,
  deleteRecord,
  getShiftById,
  getRequestByShiftId,
  getPriorityIdByShiftId,
  getRequestsByMonthYear,
  getUserById,
  getUserByList,
  approveRequestByList,
  resetRequest,
  updateShift,
  approveShiftByList,
  resetShift,
} from "../db/queries.js";

import {
  formatShiftData,
  formatResultData,
  formatMonthData,
  formatShiftApprovalList,
  formatComputedResult,
  groupRequestsByShiftId,
  formatRequest,
} from "./dataFormatters.js";

let efficiency = 0;

const getInvolvedUserObjData = async (involvedUsers) => {
  try {
    const userObj = {};
    const res = await getUserByList([...new Set(involvedUsers)]);
    if (Array.isArray(res) && res[0]) {
      res.forEach((user) => {
        userObj[user.user_id] = user;
      });
    }
    return userObj;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const approveRequest = (
  { weeks, roster },
  shift,
  request,
  requestApprovalList,
) => {
  const approvedStaffs = roster[shift.shift_id].approvedStaffs;
  // Validation
  if (approvedStaffs.includes(request.user_id)) {
    console.error("Duplicate staff in shift");
    return;
  }

  if ((!shift.week_id) in weeks) {
    throw new Error("Week not found");
  }
  const currentWeek = weeks[shift.week_id];
  const count = currentWeek.filter((x) => x === request.user_id).length;

  if (count >= 3) {
    console.error("Staff max/week already reached");
    return;
  }

  currentWeek.push(request.user_id);
  approvedStaffs.push(request.user_id);
  shift.approved_staff += 1;
  request.status = "approved";
  requestApprovalList.push({
    shift_id: shift.shift_id,
    user_id: request.user_id,
    priority_computed: request.priority_user,
  });
};

const computeConflicts = ({
  conflictPriority,
  shiftRequests,
  priorityLevel,
  shift,
  monthData,
  involvedUsers,
  requestApprovalList,
}) => {
  conflictPriority.forEach((user_id) => {
    shiftRequests.forEach((request, index) => {
      if (
        request.user_id === user_id &&
        request.priority_user === priorityLevel - 0 &&
        request.status === "pending"
      ) {
        if (shift.approved_staff < shift.min_staff) {
          approveRequest(monthData, shift, request, requestApprovalList);
          // add user to involved users
          involvedUsers.push(request.user_id);
          // remove from the conflict list
          conflictPriority.splice(index - 1, 1);
          efficiency -= request.priority_user;
        }
      }
    });
  });
};
const computeRequests = ({
  conflictPriority,
  conflictPriorityCopy,
  shiftRequests,
  priorityLevel,
  shift,
  monthData,
  involvedUsers,
  requestApprovalList,
}) => {
  shiftRequests.forEach((request) => {
    if (
      request.priority_user === priorityLevel &&
      !conflictPriorityCopy.includes(request.user_id) &&
      request.status === "pending"
    ) {
      if (shift.approved_staff >= shift.min_staff) {
        conflictPriority.push(request.user_id);
        efficiency += priorityLevel;
      } else {
        approveRequest(monthData, shift, request, requestApprovalList);
        involvedUsers.push(request.user_id);
      }
    }
  });
};

const iterateRequests = (
  monthData,
  shift,
  shiftRequests,
  priorityLevel,
  conflictPriority,
  involvedUsers,
  requestApprovalList,
  shiftApprovalListObj,
) => {
  const computeData = {
    conflictPriority,
    conflictPriorityCopy: [...conflictPriority],
    shiftRequests,
    priorityLevel,
    shift,
    monthData,
    involvedUsers,
    requestApprovalList,
  };
  // Prioritize user with previous conflict
  computeConflicts(computeData);
  computeRequests(computeData);

  // Update number of approved staff
  if (shift.approved_staff >= shift.min_staff) {
    shiftApprovalListObj[shift.shift_id] = shift.approved_staff;
  }

  return {
    ...monthData.roster[shift.shift_id],
    status: shift.approved_staff >= shift.min_staff ? "closed" : "open",
  };
};

const schedulingAlgorithm = async (requests, shiftObj, monthData) => {
  const conflictPriority = [];
  const involvedUsers = [];
  const requestApprovalList = [];
  const shiftApprovalListObj = {};

  // Populate each shift
  for (let priorityLevel = 6; priorityLevel > 0; priorityLevel--) {
    for (
      let j = monthData.shiftIdRange.start;
      j <= monthData.shiftIdRange.end;
      j++
    ) {
      // 7/30 Fix
      const shiftRequests = groupRequestsByShiftId(requests, monthData)[j];
      const shift = shiftObj[j];
      if (shift.status === "closed") continue;
      monthData.roster[j] = await iterateRequests(
        monthData,
        shift,
        shiftRequests,
        priorityLevel,
        conflictPriority,
        involvedUsers,
        requestApprovalList,
        shiftApprovalListObj,
      );
    }
  }

  // Reject all remaining requests

  console.log(`Efficiency: ${efficiency}`);

  return {
    ...formatResultData(monthData, shiftObj),
    conflicts: conflictPriority,
    involvedUsers: await getInvolvedUserObjData(involvedUsers),
    requestApprovalList,
    shiftApprovalList: formatShiftApprovalList(shiftApprovalListObj),
    requests,
  };
};

/** Compute Roster
 ** Main function to compute the roster
 * @param month int
 * @param year int
 * @param compute int
 * @returns Promise
 */
export const computeRoster = async (month, year, compute) => {
  try {
    // Resets requests and shifts to pending for overhaul computation
    if (compute === 2) {
      await resetRequest();
      await resetShift();
      efficiency = 0;
    }

    // Build request array for local use
    const requestsThisMonth = await getRequestsByMonthYear(month, year);
    const requests = requestsThisMonth[0];

    // Build shift object for local use
    const shiftData = await getShiftByMonthYear(month, year);
    const shiftObj = formatShiftData(shiftData);

    // Build month data object for local use
    const monthData = formatMonthData(shiftObj);
    //
    // bypass running algorithm if compute === 0
    let result = {};
    if (compute) {
      result = await schedulingAlgorithm(requests, shiftObj, monthData);
      const formattedRequests = formatRequest(requests);
      await approveRequestByList(formattedRequests.approved, true);
      // Reject requests
      await approveRequestByList(formattedRequests.rejected, false);
      await approveShiftByList(result.shiftApprovalList);
    } else {
      result = { ...formatComputedResult(monthData, shiftObj), requests };
    }

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
