const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const servestatic = require('serve-static');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');

const app = express();
const port = 3002;
const loginInfo = {
  ID: 'test',
  PWD: '0000'
}
const loginSuccess = {
  msg: 'login success !',
  status: true
}

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded());

app.get('/', (req, res) => {
  res.send('login server');
});

app.get('/test_get', (req, res) => {
  console.log(req.body);
  res.send('foo');
});

app.post('/test_post', (req, res) => {
  console.log(req.body);
  res.send('foo');
});

app.post('/login_process', (req, res) => {
  if (req.body.ID === loginInfo.ID && req.body.PWD === loginInfo.PWD) {
    res.cookie('id', req.body.ID);
    res.cookie('pwd', req.body.PWD);
    res.send(loginSuccess);
    // res.end();
  } else {
    res.send('login fail');
  }
});

app.post('/logout_process', (req, res) => {
  if (req.body.message === 'foo') {
    res.cookie('id', '');
    res.cookie('pwd', '');
    res.send('logout success !');
  }
});

app.listen(port, () => console.log(`server is running at port${port}`));