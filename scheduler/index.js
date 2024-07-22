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

        const priorityList = await getPriorityIdByShiftId(shift_id);


        const shiftData = await getShiftByMonthYear(2024, 8);
        const shiftObj = {}
        shiftData.forEach((shift) => {
            shiftObj[shift.shift_id] = shift;
            shiftObj[shift.shift_id].staffs = [];
        });


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

    let conflictPriority = [];

    // const shiftRequests = groupedByShiftId[2];
    // conflictPriority = fromThirtyOne(shiftObj[2], shiftRequests, 6, conflictPriority);
    //
    //
    // console.log(shiftObj[2]);


    for (let i = 1; i <= 6; i++) {
        if (!groupedByShiftId[i]) continue;
        const shiftRequests = groupedByShiftId[i];
        fromThirtyOne(shiftObj[i], shiftRequests, 6, conflictPriority);

        console.log(`Ran for shift ${i}`);
        console.log(shiftObj[i].staffs);
        console.log(`conflicts:`);
        console.log(conflictPriority);
        console.log(`-------------------`);
    }


}

const fromThirtyOne = (shift, shiftRequests, priorityLevel, conflictPriority) => {
    const {is_day, charge_nurse, min_staff, max_staff, optimal_staff, status, staffs} = shift;

    const conflictPriorityCopy = [...conflictPriority];
    // Prioritize user with previous conflict
    conflictPriority.forEach((user_id, index) => {
        shiftRequests.forEach((request, index) => {
            if (request.user_id === user_id && request.priority_user === priorityLevel) {
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

}

const approveRequest = (shift, request) => {
    shift.staffs.push(request.user_id);
    shift.approved_staff += 1;
    request.status = 'approved';
}
