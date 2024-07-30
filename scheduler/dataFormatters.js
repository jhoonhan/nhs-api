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
  return shiftObj;
};

export const formatResultData = (monthData, shiftObj) => {
  const allShifts = [];
  const openShifts = [];
  const closedShifts = [];

  Object.keys(monthData.roster).forEach((shift_id) => {
    allShifts.push({ ...shiftObj[shift_id], ...monthData.roster[shift_id] });
    if (monthData.roster[shift_id].status === "open") {
      openShifts.push({
        ...shiftObj[shift_id],
        ...monthData.roster[shift_id],
      });
    } else {
      closedShifts.push({
        ...shiftObj[shift_id],
        ...monthData.roster[shift_id],
      });
    }
  });
  return {
    allShifts: allShifts,
    open: openShifts,
    closed: closedShifts,
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
      approved_staff: shiftApprovalListObj[shift_id],
    });
  });
  return res;
};

export const formatComputedResult = (monthData, shiftObj) => {
  Object.keys(shiftObj).forEach((shift_id) => {
    if (shiftObj[shift_id].status === "closed") {
      monthData.roster[shift_id].status = "closed";
    }
  });
  return formatResultData(monthData, shiftObj);
};

export const groupRequestsByShiftId = (requests, monthData) => {
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

export const formatRequest = (requests) => {
  const res = { approved: [], rejected: [] };
  requests.forEach((request) => {
    if (request.status === "pending") {
      request.status = "rejected";
      res.rejected.push(request);
    } else if (request.status === "approved") {
      res.approved.push(request);
    }
  });

  return res;
};
