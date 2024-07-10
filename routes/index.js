import express from 'express';
import {
    createRequestHandler,
    getAllRequestsHandler,
    getRequestByIdHandler,
    // updateRequestHandler,
    deleteRequestHandler,
} from '../handlers/index.js';

const appRouter = express.Router();

appRouter.get('/', getAllRequestsHandler);
appRouter.get('/get/:shift_id/:user_id', getRequestByIdHandler);
appRouter.post('/create', createRequestHandler);
// appRouter.put('/update/:id', updateRequestHandler);
appRouter.delete('/delete/:shift_id/:user_id', deleteRequestHandler);

export default appRouter;
