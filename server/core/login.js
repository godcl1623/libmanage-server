const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const FileStore = require('session-file-store')(session);
const bcrypt = require('bcryptjs');
const axios = require('axios');
const db = require('../custom_modules/db');
const { encryptor, decryptor } = require('../custom_modules/aeser');
const { tracer, frost } = require('../custom_modules/security/fes');

const app = express();
const port = 3002;
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
  const transmitted = decryptor(req.body.foo, tracer);
  const temp = {};
  const genQueryString = string => `select mid from user_info where ${string}=?`;
  const genExists = qString => `select exists (${qString} limit 1) as isExist`;
  db.query(
    `
      ${genExists(genQueryString('user_id'))};
      ${genExists(genQueryString('user_nick'))};
      ${genExists(genQueryString('user_email'))};
    `,
    [transmitted.id, transmitted.nick, transmitted.email],
    (error, result) => {
    const checkResult = result.map(packet => packet[0].isExist);
    if (error) throw error;
    if (!checkResult.includes(1)) {
      // 등록 쿼리문 작성
      console.log('doh!');
      res.send(encryptor(transmitted, tracer));
    } else {
      [temp.id, temp.nick, temp.email] = checkResult;
      console.log(temp)
      res.send(encryptor(JSON.stringify(temp), tracer));
    }
  });
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
        [dbInfo] = result;
        const comparison = bcrypt.hashSync(dbInfo.user_pwd, loginInfo.salt);
        if (loginInfo.ID === dbInfo.user_id && loginInfo.PWD === comparison) {
          req.session.loginInfo = {
            isLoginSuccessful: true,
            nickname: dbInfo.user_nick
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

app.post('/member/register', (req, res) => {
  const transmitted = decryptor(req.body.foo, tracer);
  const temp = {};
  const genQueryString = string => `select mid from user_info where ${string}=?`;
  const genExists = qString => `select exists (${qString} limit 1) as isExist`;
  db.query(
    `
      ${genExists(genQueryString('user_id'))};
      ${genExists(genQueryString('user_nick'))};
      ${genExists(genQueryString('user_email'))};
    `,
    [transmitted.id, transmitted.nick, transmitted.email],
    (error, result) => {
    const checkResult = result.map(packet => packet[0].isExist);
    if (error) throw error;
    if (!checkResult.includes(1)) {
      // 등록 쿼리문 작성
      // res.send(encryptor(transmitted, tracer));
      const column = 'user_id, user_pwd, user_nick, user_email, created'
      const queryString = `insert into user_info (${column}) values(?, ?, ?, ?, now())`
      const values = [transmitted.id, transmitted.pwd, transmitted.nick, transmitted.email];
      db.query(queryString, values, (err, result) => {
        if (err) throw err;
        console.log(result);
      });
    } else {
      [temp.id, temp.nick, temp.email] = checkResult;
      res.send(encryptor(temp, tracer));
    }
  });
});

app.post('/member/find/id', (req, res) => {
  db.query(
    'select user_nick from user_info where user_email=?',
    [req.body.email],
    (error, result) => {
      if (error) throw error;
      if (result[0] !== undefined) {
        const nickMatchesWithEmail = result[0].user_nick;
        if (req.body.nick === nickMatchesWithEmail) {
          res.send('correct');
        } else {
          res.send('가입된 정보와 일치하지 않습니다.');
        }
      } else {
        res.send('가입되지 않은 이메일 주소입니다.');
      }
    }
  );
});

app.post('/member/find/pwd', (req, res) => {
  const genQueryString = string => `select user_nick from user_info where ${string}=?`;
  db.query(
    `
      ${genQueryString('user_id')};
      ${genQueryString('user_email')};
    `,
    [req.body.id, req.body.email],
    (error, result) => {
      if (error) throw error;
      console.log(result[1][0])
      if (result[0][0] !== undefined && result[1][0] !== undefined) {
        const nickFromId = result[0][0].user_nick;
        const nickFromEmail = result[1][0].user_nick;
        console.log(nickFromId, nickFromEmail);
        if (nickFromId === nickFromEmail) {
          res.send('correct');
        } else {
          res.send('가입된 정보와 일치하지 않습니다.');
        }
      } else {
        res.send('입력된 정보를 다시 확인해주세요.');
      }
    }
  );
});

app.listen(port, () => console.log(`server is running at port ${port}`));