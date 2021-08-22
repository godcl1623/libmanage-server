const express = require('express');

const app = express();
const port = 3003;
const test = 'message sent from api server';

app.get('/', (req, res) => {
  res.send('api server');
});

app.get('/test', (req, res) => {
  res.send(test)
});

app.listen(port, () => console.log(`server is running at port${port}`));