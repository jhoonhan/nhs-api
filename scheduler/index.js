import {
  getShiftByMonthYear,
  getRequestsByMonthYear,
  approveRequestByList,
  resetRequest,
  updateShiftByList,
  resetShift,
  getAllUser,
  getByIds,
  getPreviousComputation,
  createByList,
} from "../db/queries.js";

import {
  formatShiftData,
  formatResultData,
  formatMonthData,
  formatShiftApprovalList,
  formatComputedResult,
  groupRequestByShiftId,
  groupRequestByUserId,
  groupRequestByStatus,
  formatConflictData,
} from "./dataFormatters.js";

import { MAX_PRIORITY } from "../config.js";

let efficiency = 0;

const getUserData = async (requests) => {
  try {
    const res = {};
    const groupedRequest = groupRequestByUserId(requests);
    const allUsers = await getAllUser();

    allUsers.forEach((user) => {
      res[user.user_id] = user;
    });

    Object.keys(groupedRequest).forEach((user_id) => {
      const unusedPriorities = getUnusedPriorities(groupedRequest[user_id]);
      res[user_id] = {
        ...res[user_id],
        unusedPriorities,
        status: unusedPriorities.length === 0 ? "completed" : "incomplete",
      };
    });

    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getUnusedPriorities = (userRequest) => {
  let approvedAndPendingRequests = userRequest.approved.concat(
    userRequest.pending,
  );
  if (!approvedAndPendingRequests) {
    approvedAndPendingRequests = [];
  }

  const range = Array.from({ length: MAX_PRIORITY }, (_, i) => i + 1);
  //
  // // Map requests to an array of priority_user values
  const priorities = approvedAndPendingRequests.map(
    (request) => request.priority_user,
  );

  // Filter out those that exist in the priorities array
  return range.filter((num) => !priorities.includes(num));
};

const rejectPendingRequests = (requests) => {
  requests.forEach((request) => {
    if (request.status === "pending") {
      request.status = "rejected";
    }
  });
};

const approveRequest = (
  { weeks, roster },
  shift,
  request,
  requestApprovalList,
) => {
  const approvedStaffs = roster[shift.shift_id].approvedStaffs;
  // Validation
  if ((!shift.week_id) in weeks) {
    throw new Error("Week not found");
  }
  if (approvedStaffs.includes(request.user_id)) {
    throw new Error("Duplicate staff in shift");
  }
  // Check if more than 3 request per week
  const currentWeek = weeks[shift.week_id];
  const count = currentWeek.filter((x) => x === request.user_id).length;
  if (count >= 3) {
    throw new Error("Staff max/week already reached");
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
  requestApprovalList,
}) => {
  if (shift.shift_id <= 6 && shift.shift_id % 2 === 0) {
    console.log("Solving Conflict first");
    console.log(conflictPriority);
  }
  conflictPriority.forEach((user_id, index) => {
    shiftRequests.forEach((request) => {
      if (
        request.user_id === user_id &&
        request.priority_user === priorityLevel - 0 &&
        request.status === "pending"
      ) {
        console.log("PASS");
        if (shift.approved_staff < shift.min_staff) {
          approveRequest(monthData, shift, request, requestApprovalList);
          // remove from the conflict list
          console.log(`Conflict resolved for ${user_id}`);
          conflictPriority.splice(index - 1, 1);
          console.log(conflictPriority);
          console.log(" ");
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
      }
    }
  });
};

/**
 * Iterates through each shift and computes the requests
 * @param monthData
 * @param shift
 * @param shiftRequests
 * @param priorityLevel
 * @param conflictPriority
 * @param requestApprovalList
 * @param shiftUpdateListObj
 */
const iterateShifts = (
  monthData,
  shift,
  shiftRequests,
  priorityLevel,
  conflictPriority,
  requestApprovalList,
  shiftUpdateListObj,
) => {
  if (shift.shift_id <= 6 && shift.shift_id % 2 === 0) {
    console.log(`Shift ID: ${shift.shift_id}`);
    console.log(`Given conflict:`);
    console.log(conflictPriority);
  }
  const currentRosterShift = monthData.roster[shift.shift_id];

  const computeData = {
    conflictPriority,
    conflictPriorityCopy: [...conflictPriority],
    shiftRequests,
    priorityLevel,
    shift,
    monthData,
    requestApprovalList,
  };
  // Prioritize user with previous conflict
  computeConflicts(computeData);
  if (shift.shift_id <= 6 && shift.shift_id % 2 === 0) {
    console.log("### conflict priority after computeConflict");
    console.log(conflictPriority);
  }
  computeRequests(computeData);

  // Update number of approved staff & status
  // 8/8 - bug fix. After first iteration of computation, the shift status is not updated to closed when condition is met.
  const shiftStatus =
    shift.approved_staff >= shift.min_staff ? "closed" : "open";
  shiftUpdateListObj[shift.shift_id] = shift;
  shiftUpdateListObj[shift.shift_id].status = shiftStatus;

  // Mutate the monthData object
  if (shift.shift_id <= 6 && shift.shift_id % 2 === 0) {
    currentRosterShift.status = shiftStatus;
    console.log("End conflict");
    console.log(conflictPriority);
    console.log(" ");
  }
};

// 8-11 retrieve computation data & conflicts
const getPreviousConflict = async (record_id) => {
  try {
    const data = await getByIds("*", "conflict", [
      { key: "record_id", value: record_id },
    ]);
    return data.map((conflict) => conflict.user_id);
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const schedulingAlgorithm = async (
  requests,
  shiftObj,
  monthData,
  conflictPriority,
) => {
  const requestApprovalList = [];
  const shiftUpdateListObj = {};
  const shiftRequests = groupRequestByShiftId(requests, monthData);

  try {
    // 4-2. Iterate through each shift in each priority level
    for (let priorityLevel = MAX_PRIORITY; priorityLevel > 0; priorityLevel--) {
      for (
        let j = monthData.shiftIdRange.start;
        j <= monthData.shiftIdRange.end;
        j++
      ) {
        // Skip closed shifts
        if (shiftObj.shifts[j].status === "closed") continue;

        iterateShifts(
          monthData,
          shiftObj.shifts[j],
          shiftRequests[j],
          priorityLevel,
          conflictPriority,
          requestApprovalList,
          shiftUpdateListObj,
        );
      }
    }

    console.log(`Efficiency: ${efficiency}`);
    console.log("Updated Conflict:");
    console.log(conflictPriority);
    console.log("------------");

    return {
      ...formatResultData(monthData, shiftObj),
      conflicts: conflictPriority,
      requestApprovalList,
      shiftUpdateList: formatShiftApprovalList(shiftUpdateListObj),
      requests,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
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
    // 1. Resets requests and shifts to pending for overhaul computation
    if (compute === 2) {
      await resetRequest();
      await resetShift();
      // 8-11 remove previous computation data
      efficiency = 0;
    }

    // 2. Data Retrieval
    // Build request array for local use
    const requests = await getRequestsByMonthYear(month, year);

    // Build shift object for local use
    const shiftData = await getShiftByMonthYear(month, year);
    const shiftObj = formatShiftData(shiftData);

    // Build month data object for local use
    const monthData = formatMonthData(shiftObj);

    let result = {};

    // bypass running algorithm if compute === 0
    if (compute) {
      let iteration = 1;
      let conflictPriority = [];

      // 3. retrieve previous computation data & conflicts
      const previousComputeRecord = await getPreviousComputation(month, year);
      if (previousComputeRecord[0]) {
        iteration = previousComputeRecord[0].iteration + 1;
        conflictPriority = await getPreviousConflict(
          previousComputeRecord[0].record_id,
        );
      }

      // 4. Main function
      result = await schedulingAlgorithm(
        requests,
        shiftObj,
        monthData,
        conflictPriority,
      );

      // Change pending status to rejected
      rejectPendingRequests(requests);
      const formattedRequests = groupRequestByStatus(requests);
      await approveRequestByList(formattedRequests.approved, true);
      // Submit rejected requests
      await approveRequestByList(formattedRequests.rejected, false);
      await updateShiftByList(result.shiftUpdateList);
      // 8-11 Record computation data
      // Create computation data
      const computeRecord = {
        month,
        year,
        iteration,
      };
      const computeRecordRes = await createByList("compute_record", [
        computeRecord,
      ]);
      const record_id = computeRecordRes.insertId;
      // Record new conflict
      const formattedConflictData = formatConflictData(
        record_id,
        result.conflicts,
      );
      console.log(result.conflicts);
      await createByList("conflict", formattedConflictData);
    } else {
      result = { ...formatComputedResult(monthData, shiftObj), requests };
    }

    result["userData"] = await getUserData(requests);

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
