const express = require('express');

const app = express();
const port = 3002;
const test = 'message sent from login server';

app.get('/', (req, res) => {
  res.send('login server');
});

app.get('/test', (req, res) => {
  res.send(test);
});

app.listen(port, () => console.log(`server is running at port${port}`));