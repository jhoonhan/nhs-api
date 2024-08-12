// Init data structure
const initShifts = (shiftIdStart, shiftIdEnd) => {
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

export const formatShiftData = (shiftData) => {
  const shiftObj = { shifts: {}, id_range: {}, week_range: {} };
  shiftData.forEach((shift) => {
    shiftObj.shifts[shift.shift_id] = shift;
  });
  shiftObj.id_range = {
    start: shiftData[0].shift_id,
    end: shiftData[shiftData.length - 1].shift_id,
  };
  shiftObj.week_range = {
    start: shiftData[0].week_id,
    end: shiftData[shiftData.length - 1].week_id,
  };
  return shiftObj;
};

export const formatResultData = (monthData, shiftObj) => {
  const openShifts = [];
  const closedShifts = [];

  Object.keys(monthData.roster).forEach((shift_id) => {
    if (monthData.roster[shift_id].status === "open") {
      openShifts.push({
        ...shiftObj.shifts[shift_id],
        ...monthData.roster[shift_id],
      });
    } else {
      closedShifts.push({
        ...shiftObj.shifts[shift_id],
        ...monthData.roster[shift_id],
      });
    }
  });
  return {
    shifts: shiftObj,
    open: openShifts,
    closed: closedShifts,
    monthData,
  };
};

// After receving the shift data, we need to format it into a more usable data structure
export const formatMonthData = (shiftObj) => {
  const shiftIdStart = +shiftObj.id_range.start;
  const shiftIdEnd = +shiftObj.id_range.end;
  const weekIdStart = +shiftObj.week_range.start;
  const weekIdEnd = +shiftObj.week_range.end;
  // Initialize the roster
  return {
    roster: initShifts(shiftIdStart, shiftIdEnd),
    weeks: initWeeks(weekIdStart, weekIdEnd),
    shiftIdRange: { start: shiftIdStart, end: shiftIdEnd },
    weekIdRange: { start: weekIdStart, end: weekIdEnd },
  };
};

export const formatShiftApprovalList = (shiftApprovalListObj) => {
  const res = [];
  Object.keys(shiftApprovalListObj).forEach(async (shift_id) => {
    res.push({
      shift_id,
      approved_staff: shiftApprovalListObj[shift_id].approved_staff,
      status: shiftApprovalListObj[shift_id].status,
    });
  });
  return res;
};

export const formatComputedResult = (monthData, shiftObj) => {
  Object.keys(shiftObj.shifts).forEach((shift_id) => {
    if (shiftObj.shifts[shift_id].status === "closed") {
      monthData.roster[shift_id].status = "closed";
    }
  });
  return formatResultData(monthData, shiftObj);
};

export const groupRequestByShiftId = (requests, monthData) => {
  // 7/30 Fix
  const data = {};
  for (
    let shift_id = monthData.shiftIdRange.start;
    shift_id <= monthData.shiftIdRange.end;
    shift_id++
  ) {
    data[shift_id] = [];
  }
  requests.forEach((request) => {
    data[request.shift_id].push(request);
  });

  return data;
};

// 7/31 fix
export const groupRequestByUserId = (requests) => {
  const res = {};
  requests.forEach((request) => {
    if (!res[request.user_id]) {
      res[request.user_id] = { approved: [], pending: [], rejected: [] };
    }
    if (request.status === "pending") {
      res[request.user_id].pending.push(request);
    } else if (request.status === "approved") {
      res[request.user_id].approved.push(request);
    } else if (request.status === "rejected") {
      res[request.user_id].rejected.push(request);
    }
  });

  return res;
};

export const groupRequestByStatus = (requests) => {
  const res = { approved: [], pending: [], rejected: [] };
  requests.forEach((request) => {
    if (request.status === "pending") {
      res.pending.push(request);
    } else if (request.status === "approved") {
      res.approved.push(request);
    } else if (request.status === "rejected") {
      res.rejected.push(request);
    }
  });

  return res;
};

/**
 ** 8-11 format conflict to match conflict table's schema
 * @param record_id int
 * @param conflicts array
 * @returns array
 */
export const formatConflictData = (record_id, conflicts) => {
  return conflicts.map((userId) => {
    return {
      record_id,
      user_id: userId,
    };
  });
};
