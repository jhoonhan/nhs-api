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
    const conflicts = []

    const groupedByShiftId = requests.reduce((acc, obj) => {
        const key = obj['shift_id'];
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
    }, {});

    const month = {}


    const shiftRequests = groupedByShiftId[2];
    await fromThirtyOne(2, shiftRequests, 6);


}

const fromThirtyOne = async (shift_id, shiftRequests, priorityLevel) => {
    const shift = await getShiftById(shift_id);
    const {is_day, approved_staff, charge_nurse, min_staff, max_staff, optimal_staff, status} = shift[0];

    const filled = []
    const conflicts = []

    shiftRequests.forEach((request, index) => {
        if (request.priority_user === priorityLevel) {
            if (filled.length >= min_staff) {
                conflicts.push(request);
            } else {
                if (request.status === 'pending') {
                    filled.push(request);
                    shiftRequests[index].status = 'approved';
                }
            }
        }
    })

    // console.log('filled:');
    // console.log(filled);
    // console.log('conflicts:');
    // console.log(conflicts);
    return conflicts;
}