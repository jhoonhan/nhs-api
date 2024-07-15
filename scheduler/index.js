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
        console.log(requests);

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

    console.log(groupedByShiftId);
}