const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const FileStore = require('session-file-store')(session);

const app = express();
const port = 3002;
const loginInfo = {
  ID: 'test',
  PWD: '0000'
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
  cookie: { samesite: 'none' },
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
  if (req.body.ID === loginInfo.ID && req.body.PWD === loginInfo.PWD) {
    console.log(req)
    const loginInfo = {
      isLoginSuccessful: true,
      nickname: 'tester',
      sessionInfo: req.session
    }
    res.send(loginInfo);
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
    // res.send('logout success !');
  }
});

app.listen(port, () => console.log(`server is running at port${port}`));