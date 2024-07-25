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
} from "../db/queries.js";

let efficiency = 0;

// Init data structure
const initRoster = (shiftIdStart, shiftIdEnd) => {
  const data = {};
  for (let i = shiftIdStart; i <= shiftIdEnd; i++) {
    data[i] = {
      shiftStatus: "open",
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

const approveRequest = ({ weeks, roster }, shift, request) => {
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
};

const iterateRequests = (
  monthData,
  shift,
  shiftRequests,
  priorityLevel,
  conflictPriority,
) => {
  const { is_day, charge_nurse, min_staff, max_staff, optimal_staff, status } =
    shift;

  const conflictPriorityCopy = [...conflictPriority];
  // Prioritize user with previous conflict
  conflictPriority.forEach((user_id, index) => {
    shiftRequests.forEach((request, index) => {
      if (
        request.user_id === user_id &&
        request.priority_user === priorityLevel - 0 &&
        request.status === "pending"
      ) {
        if (shift.approved_staff < min_staff) {
          approveRequest(monthData, shift, request);
          // remove from the conflict list
          conflictPriority.splice(index - 1, 1);
          efficiency -= request.priority_user;
        }
      }
    });
  });

  shiftRequests.forEach((request) => {
    if (
      request.priority_user === priorityLevel &&
      !conflictPriorityCopy.includes(request.user_id) &&
      request.status === "pending"
    ) {
      if (shift.approved_staff >= min_staff) {
        conflictPriority.push(request.user_id);
        efficiency += priorityLevel;
      } else {
        approveRequest(monthData, shift, request);
      }
    }
  });

  const result = {
    ...monthData.roster[shift.shift_id],
    shiftStatus: shift.approved_staff >= min_staff ? "closed" : "open",
  };

  return result;
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
      monthData.roster[j] = iterateRequests(
        monthData,
        shift,
        shiftRequests,
        priorityLevel,
        conflictPriority,
      );
      // console.log(`shift: ${j}: ${conflictPriority}, staffs: ${shift.staffs}`);
    }
  }

  console.log(`Efficiency: ${efficiency}`);
  return {
    open: Object.values(monthData.roster).filter(
      (x) => x.shiftStatus === "open",
    ),
    closed: Object.values(monthData.roster).filter(
      (x) => x.shiftStatus === "closed",
    ),
    conflicts: conflictPriority,
  };
};

export const computeShift = async (month, year) => {
  try {
    // Build request array for local use
    let requests = [];
    const requestsThisMonth = await getComputedRequestByMonthYear(month, year);
    requests = requestsThisMonth[0];

    // Build shift object for local use
    const shiftData = await getShiftByMonthYear(month, year);
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

    const computedResult = await schedulingAlgorithm(requests, shiftObj);

    return computedResult;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
