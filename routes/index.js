import express from 'express';
import {
    createRequest,
    getAllRequests,
    getRequest,
    updateRequest,
    deleteRequest,
} from '../handlers/index.js';

const appRouter = express.Router();

appRouter.get('/', getAllRequests);
appRouter.get('/:id', getRequest);
appRouter.post('/create', createRequest);
appRouter.put('/update/:id', updateRequest);
appRouter.delete('/delete/:id', deleteRequest);

export default appRouter;
