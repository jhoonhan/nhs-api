import express from 'express';
import {
    createRequestHandler,
    getAllRequestsHandler,
    getRequestByShiftIdHandler,
    getRequestByRequestIdHandler,
    // updateRequestHandler,
    deleteRequestHandler,
    getComputedShiftHandler
} from '../handlers/index.js';

const appRouter = express.Router();

appRouter.get('/get-all-request', getAllRequestsHandler);
appRouter.get('/get-by-request/:shift_id/:user_id', getRequestByRequestIdHandler);
appRouter.get('/get-by-shift/:shift_id', getRequestByShiftIdHandler);
appRouter.get('/get-computed-shift/:shift_id', getComputedShiftHandler)
appRouter.post('/create', createRequestHandler);
// appRouter.put('/update/:id', updateRequestHandler);
appRouter.delete('/delete/:shift_id/:user_id', deleteRequestHandler);


export default appRouter;
