const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const servestatic = require('serve-static');
const cookieParser = require('cookie-parser');
const exSession = require('express-session');

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