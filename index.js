import express from 'express';
import appRouter from './routes/index.js';

const app = express();

// middlewares
app.use(express.json());

app.use('api/v1/products', appRouter);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});
