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
    getComputedRequestByUserPriority,
} from '../db/queries.js';


export const computeShift = async (shift_id) => {
    try {
        let requests = []
        const requestsThisMonth = await getComputedRequestByUserPriority(2024, 8);
        requests = requestsThisMonth[0];


        // Build shift object for local use
        const shiftData = await getShiftByMonthYear(2024, 8);


        const shiftObj = {}
        shiftData.forEach((shift) => {
            shiftObj[shift.shift_id] = shift;
            shiftObj[shift.shift_id].staffs = [];
        });
        shiftObj.id_range = {start: shiftData[0].shift_id, end: shiftData[shiftData.length - 1].shift_id};

        // Build the priority object for local use
        const priorityList = await getPriorityIdByShiftId(shift_id);
        const priorityObj = {};
        priorityList[0].forEach((obj) => {
            priorityObj[obj.user_id] = obj.priority;
        });

        schedulingAlgorithm(requests, shiftObj, priorityObj);

        return requests;
    } catch (error) {
        console.error(error);
        throw error;
    }

}

const schedulingAlgorithm = async (requests, shiftObj, priorityObj) => {
    const groupedByShiftId = requests.reduce((acc, obj) => {
        const key = obj['shift_id'];
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
    }, {});


    const shiftIdStart = +shiftObj.id_range.start;
    const shiftIdEnd = +shiftObj.id_range.end;


    // Initialize the month
    const roster = {};
    for (let i = shiftIdStart; i <= shiftIdEnd; i++) {
        roster[i] = false;
    }

    // Populate each shift
    let conflictPriority = [];
    for (let i = 6; i > 0; i--) {
        console.log(`priority level: ${i}`);
        for (let j = shiftIdStart; j <= shiftIdEnd; j++) {
            if (!groupedByShiftId[j]) continue;
            const shiftRequests = groupedByShiftId[j];
            const shift = shiftObj[j];
            roster[j] = fromThirtyOne(shift, shiftRequests, i, conflictPriority);
            console.log(`shift: ${j}: ${conflictPriority}, staffs: ${shift.staffs}`);
        }
    }

    // console.log(roster);
}

const fromThirtyOne = (shift, shiftRequests, priorityLevel, conflictPriority) => {
    const {is_day, charge_nurse, min_staff, max_staff, optimal_staff, status, staffs} = shift;

    const conflictPriorityCopy = [...conflictPriority];
    // Prioritize user with previous conflict
    conflictPriority.forEach((user_id, index) => {
        shiftRequests.forEach((request, index) => {
            if (request.user_id === user_id && request.priority_user >= priorityLevel - 2) {
                if (shift.approved_staff < min_staff) {
                    approveRequest(shift, request);
                    // remove from the conflict list
                    conflictPriority.splice(index - 1, 1);
                }
            }
        })
    });

    shiftRequests.forEach((request) => {
        if (request.priority_user === priorityLevel &&
            !conflictPriorityCopy.includes(request.user_id)) {
            if (shift.approved_staff >= min_staff) {
                conflictPriority.push(request.user_id);
            } else {
                if (request.status === 'pending') {
                    approveRequest(shift, request);
                }
            }
        }
    })

    return shift.approved_staff >= min_staff;
}

const approveRequest = (shift, request) => {
    if (shift.staffs.includes(request.user_id)) {
        console.log('error!!!');
    }
    shift.staffs.push(request.user_id);
    shift.approved_staff += 1;
    request.status = 'approved';
}
