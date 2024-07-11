import {find, findRequestById, createRequest, deleteRecord, findRequestByShift} from '../db/queries.js';

export const computeShift = async (shift_id) => {
    const requests = await findRequestByShift(shift_id);

    // Shift computing algorithm
    return requests;
}