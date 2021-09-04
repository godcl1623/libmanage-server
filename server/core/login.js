const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const FileStore = require('session-file-store')(session);
const bcrypt = require('bcryptjs');
const db = require('../custom_modules/db');
const { encryptor, decryptor } = require('../custom_modules/aeser');
const { tracer, frost } = require('../custom_modules/security/fes');

const app = express();
const port = 3002;
// const loginInfo = {
//   ID: '',
//   PWD: '',
//   salt: ''
// }
// const dbInfo = {
//   ID: '',
//   PWD: '',
//   nick: ''
// }
let loginInfo = {};
let dbInfo = {};

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
    // secure: true,
    maxAge: 60 * 60 * 60 * 1000
  },
  store: new FileStore()
}));

app.get('/', (req, res) => {
  res.send('login server');
});

app.post('/test_get', (req, res) => {
  const temp = {};
  // console.log(req.body.foo)
  console.log(decryptor(req.body.foo, tracer));
  // db.query('select * from user_info where user_id=?', [decryptor(req.body.id, tracer)], (error, result) => {
  //   if (error) throw error;
  //   if (result[0] === undefined) {
  //     res.send('유효한 정보입니다');
  //   } else {
  //     temp.id = result[0].user_id;
  //     temp.nick = result[0].user_nick;
  //     temp.email = result[0].user_email;
  //     console.log(temp)
  //     res.send(encryptor(JSON.stringify(temp), tracer));
  //   }
  // });
});

// app.post('/test_post', (req, res) => {
//   console.log(req);
//   const foo = req.session;
//   foo.isLogined = true;
//   foo.nickname = 'bar';
//   res.send(foo);
// });

app.post('/login_process', (req, res) => {
  loginInfo = decryptor(req.body.sofo, tracer);
  loginInfo.salt = bcrypt.getSalt(loginInfo.PWD);
  if (loginInfo.ID !== '' && loginInfo.PWD !== '') {
    db.query('select * from user_info where user_id=?', [loginInfo.ID], (error, result) => {
      if (error) throw error;
      if (result[0] === undefined) {
        res.send('등록되지 않은 ID입니다.');
      } else {
        dbInfo.ID = result[0].user_id;
        dbInfo.PWD = result[0].user_pwd;
        dbInfo.nick = result[0].user_nick;
        const comparison = bcrypt.hashSync(dbInfo.PWD, loginInfo.salt);
        if (loginInfo.ID === dbInfo.ID && loginInfo.PWD === comparison) {
          req.session.loginInfo = {
            isLoginSuccessful: true,
            nickname: dbInfo.nick
          }
          req.session.save(() => res.send(req.session.loginInfo));
        } else {
          res.send('ID 혹은 비밀번호가 잘못됐습니다.');
        }
      }
    });
  } else {
    res.send('ID와 비밀번호를 입력해주세요.');
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
    res.send('로그인 정보가 만료됐습니다. 다시 로그인 해주세요.');
  }
});

app.listen(port, () => console.log(`server is running at port ${port}`));