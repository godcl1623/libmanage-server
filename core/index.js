const express = require('express');
const fetch = require('node-fetch');

const app = express();
const port = 3001;

app.get('/', (req, res) => {
  res.send('hello server');
});

app.get('/test', (req, res) => {
  const foo = async () => {
    await fetch('http://localhost:3004/test')
    .then(response => response.text())
    .then(text => res.send(text))
  };
  foo();
});

app.listen(port, () => console.log(`server is running at port${port}`));
