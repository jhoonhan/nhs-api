import {find, findRequestById, createRequest, deleteRecord, findRequestByShift} from '../db/queries.js';

import {computeShift} from "../scheduler/index.js";

const PRIORITY = 0

export const getAllRequestsHandler = async (req, res) => {
    try {
        const requests = await find();
        return res.status(200).json({status: 'success', data: requests});

    } catch (error) {
        console.error(error);
        res.status(500).json({status: 'fail', message: 'Server Error'});
    }
};

export const getRequestByRequestIdHandler = async (req, res) => {
    try {
        const shiftId = req.params.shift_id;
        const userId = req.params.user_id;
        const request = await findRequestById(shiftId, userId);
        return res.status(200).json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({status: 'fail', message: 'Server Error'});
    }
};


export const getRequestByShiftIdHandler = async (req, res) => {
    try {
        const shiftId = req.params.shift_id;
        const request = await findRequestByShift(shiftId, userId);
        return res.status(200).json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({status: 'fail', message: 'Server Error'});
    }
};


export const createRequestHandler = async (req, res) => {
    const {shift_id, user_id, priority_user} = req.body;

    if (typeof (shift_id) !== 'number' || typeof (user_id) !== 'number') {
        return res.status(403).json({message: 'Input validation failed'});
    }

    try {
        const request = await createRequest(shift_id, user_id, priority_user);
        return res.status(201).json({status: 'success', data: request});

    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'fail', message: error.message});
    }
};


// export const updateRequestHandler = async (req, res) => {
//     const {shift_id, user_id} = req.body;
//     const id = req.params.id;
//
//     if (!title || !description || !price) {
//         return res.status(403).json({message: 'Please provide all fields'});
//     }
//
//     try {
//         const request = await update(title, description, price, id);
//
//         return res.status(201).json({request});
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({message: 'Server Error'});
//     }
// };

export const deleteRequestHandler = async (req, res) => {
    try {
        const shiftId = req.params.shift_id;
        const userId = req.params.user_id;
        const request = await deleteRecord(shiftId, userId);
        return res.status(200).json({status: 'success', data: request});
    } catch (error) {
        console.error(error);
        res.status(500).json({status: 'fail', message: error.message});
    }
};


export const getComputedShiftHandler = async (req, res) => {
    try {
        const shift_id = req.params.shift_id;
        const computedShift = await computeShift(shift_id);

        return res.status(200).json({status: 'success', data: computedShift});
    } catch (error) {
        console.error(error);
        res.status(500).json({status: 'fail', message: error.message});
    }

}