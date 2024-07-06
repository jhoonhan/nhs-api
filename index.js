import express from 'express';

const app = express();

app.use(express.json());

app.get('/', (req, res, next) => {
  console.log(req.method);

  res.send('Hello World');
});

app.post('/', (req, res, next) => {
  console.log(req.body);
  res.send('POST');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});
