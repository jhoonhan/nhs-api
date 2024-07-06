import express from 'express';
import appRouter from './routes/index.js';
import { connectToDatabase } from './db/index.js';

const app = express();

// middlewares
app.use(express.json());

app.use('/api/v1/products', appRouter);

const PORT = process.env.PORT || 5001;

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log('Server is running on port', PORT);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to database', error);
    server.close(() => {
      process.exit(1);
    });
  });

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
