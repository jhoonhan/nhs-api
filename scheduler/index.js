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

const iterateRequests = (
  monthData,
  shift,
  shiftRequests,
  priorityLevel,
  conflictPriority,
  requestApprovalList,
  shiftUpdateListObj,
) => {
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
  computeRequests(computeData);

  // Update number of approved staff & status
  // 8/8 - bug fix. After first iteration of computation, the shift status is not updated to closed when condition is met.
  const shiftStatus =
    shift.approved_staff >= shift.min_staff ? "closed" : "open";
  shiftUpdateListObj[shift.shift_id] = shift;
  shiftUpdateListObj[shift.shift_id].status = shiftStatus;
  // }

  return {
    ...monthData.roster[shift.shift_id],
    status: shiftStatus,
  };
};

// 8-11 retrieve computation data & conflicts
const getPreviousConflict = async (record_id) => {
  console.log("firing");
  try {
    const data = await getByIds("*", "conflict", [
      { key: "record_id", value: record_id },
    ]);
    console.log(data);
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

  // Populate each shift
  for (let priorityLevel = MAX_PRIORITY; priorityLevel > 0; priorityLevel--) {
    for (
      let j = monthData.shiftIdRange.start;
      j <= monthData.shiftIdRange.end;
      j++
    ) {
      // 7/30 Fix
      const shiftRequests = groupRequestByShiftId(requests, monthData)[j];
      const shift = shiftObj.shifts[j];
      if (shift.status === "closed") continue;
      monthData.roster[j] = await iterateRequests(
        monthData,
        shift,
        shiftRequests,
        priorityLevel,
        conflictPriority,
        requestApprovalList,
        shiftUpdateListObj,
      );
    }
  }

  console.log(`Efficiency: ${efficiency}`);
  console.log(conflictPriority);

  return {
    ...formatResultData(monthData, shiftObj),
    conflicts: conflictPriority,
    requestApprovalList,
    shiftUpdateList: formatShiftApprovalList(shiftUpdateListObj),
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
      // 8-11 remove previous computation data
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

    // bypass running algorithm if compute === 0
    let result = {};
    if (compute) {
      // 8-11 retrieve computation data & conflicts
      let iteration = 1;
      let conflictPriority = [];
      const previousComputeRecord = await getPreviousComputation(month, year);
      if (previousComputeRecord[0]) {
        iteration = previousComputeRecord[0].iteration + 1;
        conflictPriority = await getPreviousConflict(
          previousComputeRecord[0].record_id,
        );
      }

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
