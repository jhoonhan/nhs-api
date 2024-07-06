import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from '../handlers/index.js';

const appRouter = express.Router();

appRouter.get('/', getAllProducts);
appRouter.get('/:id', getProduct);
appRouter.post('/create', createProduct);
appRouter.put('/update/:id', updateProduct);
appRouter.delete('/delete/:id', deleteProduct);

export default appRouter;
