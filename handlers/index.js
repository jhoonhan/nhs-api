import {find, findById, create, update, deleteRecord} from '../db/queries.js';

export const getAllRequests = async (req, res) => {
    try {
        const requests = await find();
        return res.status(200).json(requests);

    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server Error'});
    }
};

export const getRequest = async (req, res) => {
    try {
        const request = await findById(req.params.id);
        return res.status(200).json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server Error'});
    }
};


export const createRequest = async (req, res) => {
    const {title, description, price} = req.body;

    if (!title || !description || !price) {
        return res.status(403).json({message: 'Please provide all fields'});
    }

    try {
        const request = await create(title, description, price);

        return res.status(201).json({request});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server Error'});
    }
};


export const updateRequest = async (req, res) => {
    const {title, description, price} = req.body;
    const id = req.params.id;

    if (!title || !description || !price) {
        return res.status(403).json({message: 'Please provide all fields'});
    }

    try {
        const request = await update(title, description, price, id);

        return res.status(201).json({request});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server Error'});
    }
};

export const deleteRequest = async (req, res) => {
    try {
        const request = await deleteRecord(req.params.id);
        return res.status(200).json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server Error'});
    }
};
