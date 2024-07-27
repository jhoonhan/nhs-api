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
  getComputedRequestByMonthYear,
  getUserById,
  getUserByList,
  updateRequestByList,
  resetRequest,
} from "../db/queries.js";

let efficiency = 0;

// Init data structure
const initRoster = (shiftIdStart, shiftIdEnd) => {
  const data = {};
  for (let i = shiftIdStart; i <= shiftIdEnd; i++) {
    data[i] = {
      status: "open",
      approvedStaffs: [],
    };
  }
  return data;
};

const initWeeks = (weekIdStart, weekIdEnd) => {
  const data = {};
  for (let i = weekIdStart; i <= weekIdEnd; i++) {
    data[i] = [];
  }
  return data;
};

const getInvolvedUserObjData = async (involvedUsers) => {
  try {
    const userObj = {};
    const res = await getUserByList([...new Set(involvedUsers)]);
    if (Array.isArray(res) && res[0]) {
      res[0].forEach((user) => {
        userObj[user.user_id] = user;
      });
    }
    return userObj;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const approveRequest = ({ weeks, roster }, shift, request, approveList) => {
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
  approveList.push({ shift_id: shift.shift_id, user_id: request.user_id });
};

const computeConflicts = ({
  conflictPriority,
  shiftRequests,
  priorityLevel,
  shift,
  monthData,
  involvedUsers,
  approveList,
}) => {
  conflictPriority.forEach((user_id) => {
    shiftRequests.forEach((request, index) => {
      if (
        request.user_id === user_id &&
        request.priority_user === priorityLevel - 0 &&
        request.status === "pending"
      ) {
        if (shift.approved_staff < shift.min_staff) {
          approveRequest(monthData, shift, request, approveList);
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
  approveList,
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
        approveRequest(monthData, shift, request, approveList);
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
  approveList,
) => {
  const computeData = {
    conflictPriority,
    conflictPriorityCopy: [...conflictPriority],
    shiftRequests,
    priorityLevel,
    shift,
    monthData,
    involvedUsers,
    approveList,
  };
  // Prioritize user with previous conflict
  computeConflicts(computeData);
  computeRequests(computeData);

  const result = {
    ...monthData.roster[shift.shift_id],
    status: shift.approved_staff >= shift.min_staff ? "closed" : "open",
  };

  return result;
};

const formatResultData = (monthData, shiftObj) => {
  const allRequests = [];
  const openRequests = [];
  const closedRequests = [];

  Object.keys(monthData.roster).forEach((shift_id) => {
    allRequests.push({ ...shiftObj[shift_id], ...monthData.roster[shift_id] });
    if (monthData.roster[shift_id].status === "open") {
      openRequests.push({
        ...shiftObj[shift_id],
        ...monthData.roster[shift_id],
      });
    } else {
      closedRequests.push({
        ...shiftObj[shift_id],
        ...monthData.roster[shift_id],
      });
    }
  });
  return {
    allRequests: allRequests,
    open: openRequests,
    closed: closedRequests,
  };
};
const schedulingAlgorithm = async (requests, shiftObj) => {
  const groupedByShiftId = requests.reduce((acc, obj) => {
    const key = obj["shift_id"];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});

  const conflictPriority = [];
  const involvedUsers = [];
  const approveList = [];

  const shiftIdStart = +shiftObj.id_range.start;
  const shiftIdEnd = +shiftObj.id_range.end;
  const weekIdStart = +shiftObj.week_range.start;
  const weekIdEnd = +shiftObj.week_range.end;

  // Initialize the roster
  const monthData = {
    roster: initRoster(shiftIdStart, shiftIdEnd),
    weeks: initWeeks(weekIdStart, weekIdEnd),
  };

  // Populate each shift
  for (let priorityLevel = 6; priorityLevel > 0; priorityLevel--) {
    // console.log(`priority level: ${i}`);
    for (let j = shiftIdStart; j <= shiftIdEnd; j++) {
      if (!groupedByShiftId[j]) continue;
      const shiftRequests = groupedByShiftId[j];
      const shift = shiftObj[j];
      monthData.roster[j] = await iterateRequests(
        monthData,
        shift,
        shiftRequests,
        priorityLevel,
        conflictPriority,
        involvedUsers,
        approveList,
      );
      // console.log(`shift: ${j}: ${conflictPriority}, staffs: ${shift.staffs}`);
    }
  }

  console.log(`Efficiency: ${efficiency}`);

  return {
    ...formatResultData(monthData, shiftObj),
    conflicts: conflictPriority,
    involvedUsers: await getInvolvedUserObjData(involvedUsers),
    approveList,
  };
};

export const computeRoster = async (month, year) => {
  try {
    // Build request array for local use
    const requestsThisMonth = await getComputedRequestByMonthYear(month, year);
    const requests = requestsThisMonth[0];
    console.log("start:");
    console.log("0");

    // Build shift object for local use
    const shiftData = await getShiftByMonthYear(month, year);
    console.log("1");
    const shiftObj = {};
    shiftData.forEach((shift) => {
      shiftObj[shift.shift_id] = shift;
    });
    shiftObj.id_range = {
      start: shiftData[0].shift_id,
      end: shiftData[shiftData.length - 1].shift_id,
    };
    shiftObj.week_range = {
      start: shiftData[0].week_id,
      end: shiftData[shiftData.length - 1].week_id,
    };
    console.log("2");

    // Resets request to pending
    // await resetRequest();
    // efficiency = 0;

    const computedResult = await schedulingAlgorithm(requests, shiftObj);
    // await updateRequestByList(computedResult.approveList);

    return computedResult;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
