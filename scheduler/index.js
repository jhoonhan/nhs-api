import {
    getAllRequest,
    getRequestById,
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

        schedulingAlgorithm(requests);

        return requests;
    } catch (error) {
        console.error(error);
        throw error;
    }

}

const schedulingAlgorithm = (requests) => {
    const conflicts = []

    const groupedByShiftId = requests.reduce((acc, obj) => {
        const key = obj['shift_id'];
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
    }, {});


    // Has to come from 31 to 0.
    Object.keys(groupedByShiftId).forEach(async (shift_id) => {
        const shiftRequests = groupedByShiftId[shift_id];
        const shift = await getShiftById(shift_id);
        const {is_day, approved_staff, charge_nurse, min_staff, max_staff, optimal_staff, status} = shift[0];

        const filled = []
        const conflict = []

        shiftRequests.forEach((request, index) => {
            if (filled.length < optimal_staff) {
                filled.push(request);
            } else {
                conflict.push(request);
            }
            shiftRequests[index] = null;
        })

        console.log(shiftRequests);
        console.log(filled);
        console.log(conflict);
    });

}