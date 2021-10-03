/* eslint-disable no-console */
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const MySQLStore = require('express-mysql-session')(session);
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { db, dbOptions, libDB } = require('../custom_modules/db');
const { encryptor, decryptor } = require('../custom_modules/aeser');
const { tracer } = require('../custom_modules/security/fes');
const swallow = require('../custom_modules/security/swallow');
const { getRandom } = require('../custom_modules/utils');

let loginInfo = {};
let dbInfo = {};
const app = express();
const port = 3002;
const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  secure: true,
  auth: swallow,
});
const genEmailOptions = (from, to, subject, html) => ({ from, to, subject, html });

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
  saveUninitialized: false,
  cookie: {
    samesite: 'none',
    // secure: true,
    maxAge: 60 * 60 * 60 * 1000
  },
  // store: new FileStore()
  store: new MySQLStore(dbOptions, db)
}));
db.connect();

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

app.post('/test_post', (req, res) => {
  console.log(req)
});

app.post('/login_process', (req, res) => {
  loginInfo = decryptor(req.body.sofo, tracer);
  if (loginInfo.ID !== undefined && loginInfo.PWD !== undefined) {
    loginInfo.salt = bcrypt.getSalt(loginInfo.PWD);
    db.query('select * from user_info where user_id=?', [loginInfo.ID], (error, result) => {
      if (error) throw error;
      if (result[0] === undefined) {
        res.send('등록되지 않은 ID입니다.');
      } else {
        [dbInfo] = result;
        console.log('stores', dbInfo.stores === '')
        const comparison = bcrypt.hashSync(dbInfo.user_pwd, loginInfo.salt);
        if (loginInfo.ID === dbInfo.user_id && loginInfo.PWD === comparison) {
          if (dbInfo.stores === '') {
            req.session.loginInfo = {
              isLoginSuccessful: true,
              nickname: dbInfo.user_nick,
              isGuest: false
            }
            req.session.save(() => res.send(req.session.loginInfo));
          } else {
            req.session.loginInfo = {
              isLoginSuccessful: true,
              nickname: dbInfo.user_nick,
              isGuest: false,
              stores: { ...dbInfo.stores }
            }
            req.session.save(() => res.send(req.session.loginInfo));
          }
        } else {
          res.send('ID 혹은 비밀번호가 잘못됐습니다.');
        }
      }
    });
  } else if (loginInfo.mode === 'guest') {
    const newGuest = `guest#${getRandom()}`;
    req.session.loginInfo = {
      isLoginSuccessful: false,
      nickname: newGuest,
      isGuest: true
    }
    req.session.save(() => res.send(req.session.loginInfo));
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
  // 빌드 전에 삭제
  console.log(req.body.message)
  console.log(req.session.loginInfo)
  if (req.body.message !== '') {
    const origin = JSON.stringify(req.session.loginInfo);
    const compare = JSON.stringify(req.body.message);
    if (origin !== compare) {
      req.session.loginInfo = req.body.message;
      if (req.session.loginInfo) {
        res.send(req.session.loginInfo);
      } else {
        res.send('로그인 정보가 만료됐습니다. 다시 로그인해 주세요.');
      }
    } else {
      res.send(req.session.loginInfo);  
    }
  } else if (req.session.loginInfo) {
    res.send(req.session.loginInfo);
  } else {
    res.send('로그인 정보가 만료됐습니다. 다시 로그인해 주세요.');
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
        res.send('success');
      });
    } else {
      [temp.id, temp.nick, temp.email] = checkResult;
      res.send(encryptor(temp, tracer));
    }
  });
});

app.post('/member/find/id', (req, res) => {
  const { nick: queryNick, email: queryEmail } = decryptor(req.body.infoObj, tracer);
  db.query(
    'select user_nick, user_id from user_info where user_email=?',
    [queryEmail],
    (error, result) => {
      if (error) throw error;
      if (result[0] !== undefined) {
        const nickMatchesWithEmail = result[0].user_nick;
        if (queryNick === nickMatchesWithEmail) {
          const subject = '아이디 찾기 요청 결과입니다.';
          const html = `
            <p>안녕하세요 ${nickMatchesWithEmail}님,<br>
            요청하신 아이디는 다음과 같습니다.</p>
            <p>아이디: ${result[0].user_id}</p>
            <p>비밀번호를 찾으시려면 아래 링크를 클릭해주세요.</p>
            <p><a href="http://localhost:3000/member/find/pwd">링크</a></p>
          `;
          const successMsg = '메일이 발송되었습니다.\n메세지 함을 확인해주세요.'
          const emailOptions = genEmailOptions(`관리자 <${swallow.user}>`, queryEmail, subject, html);
          transporter.sendMail(emailOptions, (err, info) => {
            if (err) {
              console.log(err);
              res.send('오류가 발생했습니다')
            }
            console.log(info);
            res.send(successMsg);
          });
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
  const {id: queryId, email: queryEmail} = decryptor(req.body.infoObj, tracer);
  const genQueryString = string => `select user_nick from user_info where ${string}=?`;
  db.query(
    `
      ${genQueryString('user_id')};
      ${genQueryString('user_email')};
    `,
    [queryId, queryEmail],
    (error, result) => {
      if (error) throw error;
      if (result[0][0] !== undefined && result[1][0] !== undefined) {
        const nickFromId = result[0][0].user_nick;
        const nickFromEmail = result[1][0].user_nick;
        if (nickFromId === nickFromEmail) {
          const token = crypto.randomBytes(64).toString('hex');
          const authData = {
            token,
            userId: queryId,
            ttl: 300
          };
          db.query(
            'insert into user_token (token_body, created) values(?, now())',
            [JSON.stringify(authData)]
          )
          const subject = '비밀번호 찾기 요청 결과입니다.';
          const html = `
            <p>안녕하세요 ${nickFromId}님,<br>
            비밀번호 초기화 안내 메일을 보내드립니다.</p>
            <p>비밀번호를 초기화하시려면 아래 링크를 클릭해주세요.</p>
            <p><a href="http://localhost:3000/member/reset/${token}">링크</a></p>
          `;
          const emailOptions = genEmailOptions(`관리자 <${swallow.user}>`, queryEmail, subject, html);
          transporter.sendMail(emailOptions, (err, info) => {
            if (err) {
              console.log(err);
              res.send('오류가 발생했습니다');
            }
            console.log(info);
            res.send('메일이 발송되었습니다.\n메세지 함을 확인해주세요.');
          });
        } else {
          res.send('가입된 정보와 일치하지 않습니다.');
        }
      } else {
        res.send('입력된 정보를 다시 확인해주세요.');
      }
    }
  );
});

app.post('/member/reset', (req, res) => {
  const { tokenTail, requestedTime} = decryptor(req.body.postData, tracer);
  if (tokenTail && requestedTime) {
    db.query(
      'select * from user_token where token_body like ?',
      [`%${tokenTail}%`],
      (err, result) => {
        if (result[0] !== undefined) {
          const requestedToken = JSON.parse(result[0].token_body);
          requestedToken.tokenId = result[0].req_id;
          const createdTime = result[0].created;
          requestedToken.originTime = createdTime;
          const reqTimeVal = new Date(requestedTime);
          const createdTimeVal = new Date(createdTime);
          const timeDiff = (reqTimeVal - createdTimeVal) / 1000;
          if (timeDiff <= requestedToken.ttl) {
            res.send({
              tokenState: true,
              token: requestedToken
            });
          } else {
            res.send({
              tokenState: false
            });
          }
        } else {
          res.send({
            tokenState: 'no_token'
          });
        }
      });
  } else {
    res.send({
      tokenState: 'abnormal'
    });
  }
});

app.post('/member/reset/pwd', (req, res) => {
  const {
    id: userId,
    pwd: newPwd,
    tokenId,
    ttl,
    reqTime,
    originTime
  } = decryptor(req.body.formData, tracer);
  const reqTimeVal = new Date(reqTime);
  const createdTimeVal = new Date(originTime);
  const timeDiff = (reqTimeVal - createdTimeVal) / 1000;;
  if (userId && newPwd) {
    if (timeDiff <= ttl) {
      db.query(
        'update user_info set user_pwd=? where user_id=?',
        [newPwd, userId],
        (err, result) => {
          if (err) throw err;
          if (result.changedRows) {
            db.query(
              'delete from user_token where req_id=?',
              [tokenId],
              (err, result) => {
                if (err) throw err;
                if (result.affectedRows) {
                  res.send('complete');
                } else {
                  res.send('error');
                }
              }
            );
          }
        }
      )
    } else {
      db.query(
        'delete from user_token where req_id=?',
        [tokenId],
        (err, result) => {
          if (err) throw err;
          if (result.affectedRows) {
            res.send('expired');
          } else {
            res.send('error');
          }
        }
      )
    }
  } else {
    res.send('error');
  }
});

app.listen(port, () => console.log(`server is running at port ${port}`));