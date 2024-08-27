import {
  rejectPendingRequests,
  approveRequest,
  computeConflicts,
} from "../scheduler/index.mjs"; // adjust the import path as needed

describe("rejectPendingRequests", () => {
  it("should change the status of all pending requests to rejected", () => {
    const requests = [
      { status: "approved" },
      { status: "pending" },
      { status: "pending" },
      { status: "rejected" },
    ];

    rejectPendingRequests(requests);

    const pendingRequests = requests.filter(
      (request) => request.status === "pending",
    );
    const rejectedRequests = requests.filter(
      (request) => request.status === "rejected",
    );

    expect(pendingRequests.length).toBe(0);
    expect(rejectedRequests.length).toBe(3);
  });
});

describe("approveRequest", () => {
  it("should approve a request and update the week, roster, and requestApprovalList correctly", () => {
    const weeks = { 1: [] };
    const roster = { 1: { approvedStaffs: [] } };
    const shift = {
      shift_id: "1",
      week_id: "1",
      approved_staff: 0,
      min_staff: 1,
    };
    const request = { user_id: "1", status: "pending", priority_user: 1 };
    const requestApprovalList = [];

    approveRequest({ weeks, roster }, shift, request, requestApprovalList);

    expect(weeks["1"]).toEqual(["1"]);
    expect(roster["1"].approvedStaffs).toEqual(["1"]);
    expect(shift.approved_staff).toBe(1);
    expect(request.status).toBe("approved");
    expect(requestApprovalList).toEqual([
      { shift_id: "1", user_id: "1", priority_computed: 1 },
    ]);
  });

  it("should throw an error if the staff is already approved for the shift", () => {
    const weeks = { 1: [] };
    const roster = { 1: { approvedStaffs: ["1"] } };
    const shift = {
      shift_id: "1",
      week_id: "1",
      approved_staff: 0,
      min_staff: 1,
    };
    const request = { user_id: "1", status: "pending", priority_user: 1 };
    const requestApprovalList = [];

    expect(() =>
      approveRequest({ weeks, roster }, shift, request, requestApprovalList),
    ).toThrow("Duplicate staff in shift");
  });

  it("should throw an error if the staff has already been approved for 3 requests in the week", () => {
    const weeks = { 1: ["1", "1", "1"] };
    const roster = { 1: { approvedStaffs: [] } };
    const shift = {
      shift_id: "1",
      week_id: "1",
      approved_staff: 0,
      min_staff: 1,
    };
    const request = { user_id: "1", status: "pending", priority_user: 1 };
    const requestApprovalList = [];

    expect(() =>
      approveRequest({ weeks, roster }, shift, request, requestApprovalList),
    ).toThrow("Staff max/week already reached");
  });
});
