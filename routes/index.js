import { Router } from 'express';
import {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from '../handlers';

const appRouter = Router();

appRouter.get('/', getAllProducts);
appRouter.get('/:id', getProduct);
appRouter.post('/create', createProduct);
appRouter.put('/update/:id', updateProduct);
appRouter.delete('/delete/:id', deleteProduct);

export default appRouter;
