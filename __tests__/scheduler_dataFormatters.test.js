import {
  initShifts,
  initWeeks,
  formatShiftData,
  formatResultData,
  formatMonthData,
  formatShiftApprovalList,
  formatComputedResult,
  groupRequestByShiftId,
  groupRequestByUserId,
  groupRequestByStatus,
  formatConflictData,
} from "../scheduler/dataFormatters.js";

describe("Data Formatters", () => {
  it("should initialize shifts", () => {
    const result = initShifts(1, 3);
    expect(result).toEqual({
      1: { status: "open", approvedStaffs: [] },
      2: { status: "open", approvedStaffs: [] },
      3: { status: "open", approvedStaffs: [] },
    });
  });

  it("should initialize weeks", () => {
    const result = initWeeks(1, 3);
    expect(result).toEqual({
      1: [],
      2: [],
      3: [],
    });
  });

  // Continue with similar tests for the other functions...
});
describe("formatShiftData", () => {
  it("should format shift data correctly", () => {
    const shiftData = [
      { shift_id: "1", week_id: "1", name: "Shift 1" },
      { shift_id: "2", week_id: "2", name: "Shift 2" },
      { shift_id: "3", week_id: "3", name: "Shift 3" },
    ];

    const result = formatShiftData(shiftData);

    expect(result).toEqual({
      shifts: {
        1: { shift_id: "1", week_id: "1", name: "Shift 1" },
        2: { shift_id: "2", week_id: "2", name: "Shift 2" },
        3: { shift_id: "3", week_id: "3", name: "Shift 3" },
      },
      id_range: {
        start: "1",
        end: "3",
      },
      week_range: {
        start: "1",
        end: "3",
      },
    });
  });
});

describe("formatResultData", () => {
  it("should format result data correctly", () => {
    const monthData = {
      roster: {
        1: { status: "open", approvedStaffs: ["Staff 1"] },
        2: { status: "closed", approvedStaffs: ["Staff 2"] },
        3: { status: "open", approvedStaffs: ["Staff 3"] },
      },
    };

    const shiftObj = {
      shifts: {
        1: { shift_id: "1", week_id: "1", name: "Shift 1" },
        2: { shift_id: "2", week_id: "2", name: "Shift 2" },
        3: { shift_id: "3", week_id: "3", name: "Shift 3" },
      },
      id_range: {
        start: "1",
        end: "3",
      },
      week_range: {
        start: "1",
        end: "3",
      },
    };

    const result = formatResultData(monthData, shiftObj);

    expect(result).toEqual({
      shifts: shiftObj,
      open: [
        {
          shift_id: "1",
          week_id: "1",
          name: "Shift 1",
          status: "open",
          approvedStaffs: ["Staff 1"],
        },
        {
          shift_id: "3",
          week_id: "3",
          name: "Shift 3",
          status: "open",
          approvedStaffs: ["Staff 3"],
        },
      ],
      closed: [
        {
          shift_id: "2",
          week_id: "2",
          name: "Shift 2",
          status: "closed",
          approvedStaffs: ["Staff 2"],
        },
      ],
      monthData,
    });
  });
});

describe("formatMonthData", () => {
  it("should format month data correctly", () => {
    const shiftObj = {
      shifts: {
        1: { shift_id: "1", week_id: "1", name: "Shift 1" },
        2: { shift_id: "2", week_id: "2", name: "Shift 2" },
        3: { shift_id: "3", week_id: "3", name: "Shift 3" },
      },
      id_range: {
        start: "1",
        end: "3",
      },
      week_range: {
        start: "1",
        end: "3",
      },
    };

    const result = formatMonthData(shiftObj);

    expect(result).toEqual({
      roster: initShifts(1, 3),
      weeks: initWeeks(1, 3),
      shiftIdRange: { start: 1, end: 3 },
      weekIdRange: { start: 1, end: 3 },
    });
  });
});

describe("formatShiftApprovalList", () => {
  it("should format shift approval list correctly", () => {
    const shiftApprovalListObj = {
      1: { approved_staff: ["Staff 1", "Staff 2"], status: "open" },
      2: { approved_staff: ["Staff 3"], status: "closed" },
      3: { approved_staff: [], status: "open" },
    };

    const result = formatShiftApprovalList(shiftApprovalListObj);

    expect(result).toEqual([
      { shift_id: "1", approved_staff: ["Staff 1", "Staff 2"], status: "open" },
      { shift_id: "2", approved_staff: ["Staff 3"], status: "closed" },
      { shift_id: "3", approved_staff: [], status: "open" },
    ]);
  });
});

describe("formatComputedResult", () => {
  it("should format computed result correctly", () => {
    const monthData = {
      roster: {
        1: { status: "open", approvedStaffs: ["Staff 1"] },
        2: { status: "open", approvedStaffs: ["Staff 2"] },
        3: { status: "open", approvedStaffs: ["Staff 3"] },
      },
    };

    const shiftObj = {
      shifts: {
        1: { shift_id: "1", week_id: "1", name: "Shift 1", status: "closed" },
        2: { shift_id: "2", week_id: "2", name: "Shift 2", status: "open" },
        3: { shift_id: "3", week_id: "3", name: "Shift 3", status: "closed" },
      },
      id_range: {
        start: "1",
        end: "3",
      },
      week_range: {
        start: "1",
        end: "3",
      },
    };

    const result = formatComputedResult(monthData, shiftObj);

    const expectedResult = formatResultData(
      {
        roster: {
          1: { status: "closed", approvedStaffs: ["Staff 1"] },
          2: { status: "open", approvedStaffs: ["Staff 2"] },
          3: { status: "closed", approvedStaffs: ["Staff 3"] },
        },
      },
      shiftObj,
    );

    expect(result).toEqual(expectedResult);
  });
});

describe("groupRequestByShiftId", () => {
  it("should group requests by shift id correctly", () => {
    const requests = [
      { shift_id: "1", user_id: "1", status: "pending" },
      { shift_id: "2", user_id: "2", status: "approved" },
      { shift_id: "1", user_id: "3", status: "rejected" },
      { shift_id: "3", user_id: "1", status: "pending" },
      { shift_id: "2", user_id: "3", status: "approved" },
    ];

    const monthData = {
      shiftIdRange: { start: "1", end: "3" },
    };

    const result = groupRequestByShiftId(requests, monthData);

    expect(result).toEqual({
      1: [
        { shift_id: "1", user_id: "1", status: "pending" },
        { shift_id: "1", user_id: "3", status: "rejected" },
      ],
      2: [
        { shift_id: "2", user_id: "2", status: "approved" },
        { shift_id: "2", user_id: "3", status: "approved" },
      ],
      3: [{ shift_id: "3", user_id: "1", status: "pending" }],
    });
  });
});

describe("groupRequestByUserId", () => {
  it("should group requests by user id correctly", () => {
    const requests = [
      { user_id: "1", status: "pending" },
      { user_id: "2", status: "approved" },
      { user_id: "1", status: "rejected" },
      { user_id: "3", status: "pending" },
      { user_id: "2", status: "approved" },
    ];

    const result = groupRequestByUserId(requests);

    expect(result).toEqual({
      1: {
        approved: [],
        pending: [{ user_id: "1", status: "pending" }],
        rejected: [{ user_id: "1", status: "rejected" }],
      },
      2: {
        approved: [
          { user_id: "2", status: "approved" },
          { user_id: "2", status: "approved" },
        ],
        pending: [],
        rejected: [],
      },
      3: {
        approved: [],
        pending: [{ user_id: "3", status: "pending" }],
        rejected: [],
      },
    });
  });
});

describe("groupRequestByStatus", () => {
  it("should group requests by status correctly", () => {
    const requests = [
      { user_id: "1", status: "pending" },
      { user_id: "2", status: "approved" },
      { user_id: "1", status: "rejected" },
      { user_id: "3", status: "pending" },
      { user_id: "2", status: "approved" },
    ];

    const result = groupRequestByStatus(requests);

    expect(result).toEqual({
      approved: [
        { user_id: "2", status: "approved" },
        { user_id: "2", status: "approved" },
      ],
      pending: [
        { user_id: "1", status: "pending" },
        { user_id: "3", status: "pending" },
      ],
      rejected: [{ user_id: "1", status: "rejected" }],
    });
  });
});

describe("formatConflictData", () => {
  it("should format conflict data correctly", () => {
    const record_id = 1;
    const conflicts = ["2", "3", "4"];

    const result = formatConflictData(record_id, conflicts);

    expect(result).toEqual([
      { record_id: 1, user_id: "2" },
      { record_id: 1, user_id: "3" },
      { record_id: 1, user_id: "4" },
    ]);
  });
});
