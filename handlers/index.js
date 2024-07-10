import {find, findRequestById, createRequest, deleteRecord} from '../db/queries.js';

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

export const getRequestByIdHandler = async (req, res) => {
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


export const createRequestHandler = async (req, res) => {
    const {shift_id, user_id} = req.body;

    if (typeof (shift_id) !== 'number' || typeof (user_id) !== 'number') {
        return res.status(403).json({message: 'Input validation failed'});
    }

    try {
        const request = await createRequest(shift_id, user_id, PRIORITY);
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
