import {
    getAllRequest,
    getRequestById,
    createRequest,
    deleteRecord,
    getRequestByShiftId,
    getPriorityIdByShiftId
} from '../db/queries.js';


export const computeShift = async (shift_id) => {
    try {
        const requests = await getRequestByShiftId(shift_id);
        if (requests.length === 0) {
            return [];
        }
        console.log(requests);
        const priority = await getPriorityIdByShiftId(shift_id);
        // console.log(priority[0]);

        // Shift computing algorithm

        return priority;
    } catch (error) {
        console.error(error);
        throw error;
    }

}