const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const FileStore = require('session-file-store')(session);
const bcrypt = require('bcryptjs');
const { decryptor } = require('../custom_modules/aeser');

const app = express();
const port = 3002;
const loginInfo = {
  ID: 'test',
  PWD: '2aed7860fb0641cb3414971c6ca52c452265c8a0dab3853175b1127ce040022e'
}

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded());
app.use(helmet(), compression());
app.use(session({
  secret: 'piano',
  resave: false,
  saveUninitialized: true,
  cookie: {
    samesite: 'none',
    // secure: true
  },
  store: new FileStore()
}));

app.get('/', (req, res) => {
  res.send('login server');
});

app.get('/test_get', (req, res) => {
  console.log(req.body);
  res.send('foo');
});

app.post('/test_post', (req, res) => {
  console.log(req);
  const foo = req.session;
  foo.isLogined = true;
  foo.nickname = 'bar';
  res.send(foo);
});

app.post('/login_process', (req, res) => {
  const decryptedID = decryptor(req.body.ID);
  const decryptedPWD = decryptor(req.body.PWD);
  const resultPWD = bcrypt.hashSync(loginInfo.PWD, bcrypt.getSalt(decryptedPWD));
  // // const transmittedPwd = bcrypt.hashSync(loginInfo.PWD, bcrypt.getSalt(req.body.PWD));
  // // if (req.body.ID === loginInfo.ID && req.body.PWD === transmittedPwd) {
  if (decryptedID === loginInfo.ID && decryptedPWD === resultPWD) {
    req.session.loginInfo = {
      isLoginSuccessful: true,
      nickname: 'tester'
    }
    req.session.save(() => res.send(req.session.loginInfo));
  } else {
    res.send('login fail');
  }
});

app.post('/logout_process', (req, res) => {
  if (req.body.message === 'foo') {
    const logoutInfo = {
      isLoginSuccessful: false,
      nickname: ''
    }
    req.session.destroy(() => {
      res.send(logoutInfo);
    });
  }
});

app.post('/check_login', (req, res) => {
  if (req.session.loginInfo) {
    res.send(req.session.loginInfo);
  } else {
    res.send('');
  }
});

app.listen(port, () => console.log(`server is running at port ${port}`));