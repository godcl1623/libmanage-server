const express = require('express');

const app = express();
const port = 3004;
const test = 'message sent from client server';

app.get('/', (req, res) => {
  res.send('client communication server');
});

app.get('/test', (req, res) => {
  res.send(test)
});

app.listen(port, () => console.log(`server is running at port${port}`));