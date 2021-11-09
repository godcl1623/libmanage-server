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
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const axios = require('axios');
const igdb = require('igdb-api-node').default;
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { dbProdOptions, prodDB } = require('./custom_modules/db');
const { encryptor, decryptor } = require('./custom_modules/aeser');
const { getRandom } = require('./custom_modules/utils');

const app = express();
const port = process.env.PORT || 3001;
let loginInfo = {};
let dbInfo = {};
let uid = '';
let gameList = '';
let apiCredential = '';
let requestedUser = '';
const statObj = {
  count: 0,
  total: 0,
  status: 1
};
const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: process.env.PORT_TRANSPORTER,
  secure: true,
  auth: {
    user: process.env.SWALLOWAC,
    pass: process.env.SWALLOWP
  }
});
const genEmailOptions = (from, to, subject, html) => ({
  from,
  to,
  subject,
  html
});
// const handleDBConnection = () => {
//   // prodDB.connect(err => {
//     prodDB.getConnection(err => {
//     if (err) {
//       console.log(`error when connecting to db: ${err}`);
//       setTimeout(handleDBConnection, 2000);
//     }
//   });

//   prodDB.on('error', err => {
//     console.log(`db error: ${err}`);
//     if (err.code === 'PROTOCOL_CONNECTION_LOST') {
//       return handleDBConnection();
//     // eslint-disable-next-line no-else-return
//     } else {
//       throw err;
//     }
//   });
// }

app.set('port', process.env.PORT || 3001);
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(cookieParser('piano'));
app.use(bodyParser.json());
app.use(helmet(), compression());
app.use(
  session({
    secret: 'piano',
    resave: false,
    saveUninitialized: false,
    cookie: {
      samesite: 'none',
      secure: true,
      maxAge: 60 * 60 * 60 * 1000
    },
    store: new MySQLStore(dbProdOptions, prodDB)
  })
);
// app.set('trusy proxy', 1);
// db.connect();
// libDB.connect();
// prodDB.connect();
// handleDBConnection();
// prodDB.getConnection((err, conn) => {
//   if (!err) {
//     conn.query();
//   }
//   conn.release();
// })

/* #################### 로그인 서버 #################### */

app.get('/', (req, res) => {
  res.send('login server');
});

app.post('/login_process', (req, res) => {
  loginInfo = decryptor(req.body.sofo, process.env.TRACER);
  if (loginInfo.ID !== undefined && loginInfo.PWD !== undefined) {
    loginInfo.salt = bcrypt.getSalt(loginInfo.PWD);
    prodDB.query(
      'select * from user_info where user_id=?',
      [loginInfo.ID],
      (error, result) => {
        if (error) throw error;
        if (result[0] === undefined) {
          res.send('등록되지 않은 ID입니다.');
        } else {
          [dbInfo] = result;
          console.log(dbInfo);
          const comparison = bcrypt.hashSync(dbInfo.user_pwd, loginInfo.salt);
          if (loginInfo.ID === dbInfo.user_id && loginInfo.PWD === comparison) {
            if (dbInfo.stores === undefined) {
              req.session.loginInfo = {
                isLoginSuccessful: true,
                nickname: dbInfo.user_nick,
                isGuest: false,
                sid: req.sessionID
              };
              // req.session.save(() => res.send(req.session.loginInfo));
              res.send(req.session.loginInfo);
            } else {
              req.session.loginInfo = {
                isLoginSuccessful: true,
                nickname: dbInfo.user_nick,
                isGuest: false,
                sid: req.sessionID,
                stores: { ...JSON.parse(dbInfo.stores) }
              };
              // req.session.save(() => res.send(req.session.loginInfo));
              res.send(req.session.loginInfo);
            }
          } else {
            res.send('ID 혹은 비밀번호가 잘못됐습니다.');
          }
        }
      }
    );
  } else if (loginInfo.mode === 'guest') {
    const newGuest = `guest#${getRandom()}`;
    req.session.loginInfo = {
      isLoginSuccessful: true,
      nickname: newGuest,
      isGuest: true
    };
    req.session.save(() => res.send(req.session.loginInfo));
  } else {
    res.send('ID와 비밀번호를 입력해주세요.');
  }
});

app.post('/logout_process', (req, res) => {
  const { reqMsg, million } = req.body.message;
  if (reqMsg === 'logout') {
    const sentOne = JSON.parse(decryptor(million, process.env.TRACER));
    const { sid } = sentOne;
    console.log(sid);
    const logoutInfo = {
      isLoginSuccessful: false,
      nickname: ''
    };
    req.session.destroy(() => {
      prodDB.query(
        'delete from sessions where session_id=?',
        [sentOne.sid],
        (err, result) => {
          if (err) throw err;
          if (result) {
            res.send(logoutInfo);
          }
        }
      );
    });
  }
});

app.post('/check_login', (req, res) => {
  // 쿠키를 사용할 수 없는 상황이므로 DB에 저장된 세션 이용
  // comparisonState: 스토어 연동 이후 사용자 정보 갱신을 위한 객체
  // info: 사용자 브라우저의 로컬 저장소에 저장된 세션
  const { comparisonState, million } = req.body.message;
  // console.log(req.body.message)
  // 만약 저장된 세션이 없을 경우: 로그인 유도
  if (million === null) {
    res.send('no_sessions');
    // 사용자로부터 세션이 넘어왔을 경우
  } else {
    // 세션을 parse하여 DB에 해당 세션이 존재하는지 확인(로그인 시점에 부여된 세션id 사용)
    const sentOne = JSON.parse(decryptor(million, process.env.TRACER));
    prodDB.query(
      `select * from sessions where session_id=?`,
      [sentOne.sid],
      (err, result) => {
        if (err) throw err;
        // DB에 사용자 세션이 존재할 경우
        // console.log(result)
        if (result[0]) {
          const { data } = result[0];
          // DB에 저장된 사용자 세션 parse, 쿠키에 저장된 만료 시점을 Date 객체에 넣어 계산 가능하도록 설정
          const gotOne = JSON.parse(data);
          const thatTime = new Date(gotOne.cookie.expires);
          // 로그인 체크를 수행하는 시점
          const thisTime = new Date();
          // 로그인 체크 수행 시점이 DB에 저장된 만료 시점보다 늦음 = 세션이 만료됨
          // 세션 만료 메세지 + 기존에 저장된 세션 삭제(브라우저+DB) + 로그인 유도
          if (thisTime - thatTime > 0) {
            prodDB.query(
              'delete from sessions where session_id=?',
              [sentOne.sid],
              (err, result) => {
                if (err) throw err;
                if (result) {
                  res.send('session_expired');
                }
              }
            );
            // 세션이 아직 만료되지 않음 - 처리해야 할 상황 목록
            /*
          1. [comparisonState !== ''] = 스토어 연동이 발생해 사용자 정보 갱신이 필요함
            (1) comparisonState로 넘어온 사용자 정보가 기존에 저장된 정보와 일치 -> 기존 로그인 정보 전송
            (2) comparisonState로 넘어온 정보가 기존 정보와 불일치 -> 정보 갱신 후 DB에 갱신된 정보 저장 및 갱신된 정보 전송
          2. [comparisonState === ''] = 일반적인 로그인 체크
          3. 그 외: 로그인이 풀린 것으로 간주하여 로그인 체크 유도
        */
          } else if (comparisonState !== '') {
            const newSession = {
              cookie: {
                ...gotOne.cookie
              },
              loginInfo: {
                ...comparisonState
              }
            };
            const compare = JSON.stringify(newSession);
            if (data !== compare) {
              // console.log('newSession', JSON.stringify(newSession));
              prodDB.query(
                'update sessions set data=? where session_id=?',
                [compare, sentOne.sid],
                (err, result) => {
                  if (err) throw err;
                  if (result) {
                    res.send(newSession.loginInfo);
                  }
                  // res.send('check_failed');
                }
              );
            } else {
              res.send(gotOne.loginInfo);
            }
          } else if (gotOne.loginInfo) {
            res.send(gotOne.loginInfo);
          } else {
            prodDB.query(
              'delete from sessions where session_id=?',
              [sentOne.sid],
              (err, result) => {
                if (err) throw err;
                if (result) {
                  res.send('check_failed');
                }
              }
            );
          }
          // DB에 사용자 세션이 존재하지 않을 경우 - 기존에 저장된 세션을 삭제하고 로그인 유도
        } else {
          res.send('session_expired');
        }
      }
    );
  }
});

app.post('/member/register', (req, res) => {
  const transmitted = decryptor(req.body.foo, process.env.TRACER);
  const temp = {};
  const genQueryString = string =>
    `select mid from user_info where ${string}=?`;
  const genExists = qString => `select exists (${qString} limit 1) as isExist`;
  prodDB.query(
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
        // res.send(encryptor(transmitted, process.env.TRACER));
        const column = 'user_id, user_pwd, user_nick, user_email, created';
        const queryString = `insert into user_info (${column}) values(?, ?, ?, ?, now())`;
        const values = [
          transmitted.id,
          transmitted.pwd,
          transmitted.nick,
          transmitted.email
        ];
        prodDB.query(queryString, values, (err, result) => {
          if (err) throw err;
          console.log(result);
          res.send('success');
        });
      } else {
        [temp.id, temp.nick, temp.email] = checkResult;
        res.send(encryptor(temp, process.env.TRACER));
      }
    }
  );
});

app.post('/member/find/id', (req, res) => {
  const { nick: queryNick, email: queryEmail } = decryptor(
    req.body.infoObj,
    process.env.TRACER
  );
  prodDB.query(
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
            <p><a href="https://godcl1623-libmanage.herokuapp.com/member/find/pwd">링크</a></p>
          `;
          const successMsg =
            '메일이 발송되었습니다.\n메세지 함을 확인해주세요.';
          const emailOptions = genEmailOptions(
            `관리자 <${process.env.SWALLOWAC}>`,
            queryEmail,
            subject,
            html
          );
          transporter.sendMail(emailOptions, (err, info) => {
            if (err) {
              console.log(err);
              res.send('오류가 발생했습니다');
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
  const { id: queryId, email: queryEmail } = decryptor(
    req.body.infoObj,
    process.env.TRACER
  );
  const genQueryString = string =>
    `select user_nick from user_info where ${string}=?`;
  prodDB.query(
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
          const timeStamp = () => {
            const today = new Date();
            today.setHours(today.getHours()+9);
            return today.toISOString().replace('T', ' ').substring(0, 19);
          };
          prodDB.query(
            'insert into user_token (token_body, created) values(?, ?)',
            [JSON.stringify(authData), timeStamp()]
          );
          const subject = '비밀번호 찾기 요청 결과입니다.';
          const html = `
            <p>안녕하세요 ${nickFromId}님,<br>
            비밀번호 초기화 안내 메일을 보내드립니다.</p>
            <p>비밀번호를 초기화하시려면 아래 링크를 클릭해주세요.</p>
            <p><a href="https://godcl1623-libmanage.herokuapp.com/member/reset/${token}">링크</a></p>
          `;
          const emailOptions = genEmailOptions(
            `관리자 <${process.env.SWALLOWAC}>`,
            queryEmail,
            subject,
            html
          );
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
  const { tokenTail, requestedTime } = decryptor(
    req.body.postData,
    process.env.TRACER
  );
  if (tokenTail && requestedTime) {
    prodDB.query(
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
      }
    );
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
  } = decryptor(req.body.formData, process.env.TRACER);
  const reqTimeVal = new Date(reqTime);
  const createdTimeVal = new Date(originTime);
  const timeDiff = (reqTimeVal - createdTimeVal) / 1000;
  if (userId && newPwd) {
    if (timeDiff <= ttl) {
      prodDB.query(
        'update user_info set user_pwd=? where user_id=?',
        [newPwd, userId],
        (err, result) => {
          if (err) throw err;
          if (result.changedRows) {
            prodDB.query(
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
      );
    } else {
      prodDB.query(
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
      );
    }
  } else {
    res.send('error');
  }
});

app.post('/verify', (req, res) => {
  const { sofo } = req.body;
  const { NICK, PWD } = decryptor(sofo, process.env.TRACER);
  prodDB.query('select user_pwd from user_info where user_nick=?', [NICK], (err, result) => {
    if (err) throw err;
    const dbPwd = result[0].user_pwd;
    const verifySalt = bcrypt.getSalt(PWD);
    const comparison = bcrypt.hashSync(dbPwd, verifySalt);
    if (PWD === comparison) {
      res.send(true);
    } else {
      res.send(false);
    }
  })
})

app.put('/member/update', (req, res) => {
  const { sofo, reqUser } = decryptor(req.body.foo, process.env.TRACER);
  const genQueryString = (key, val) =>
    `select mid from user_info where user_${key}='${val}'`;
  const genExists = qString => `select exists (${qString} limit 1) as isExist`;
  const checkQueries = Object.keys(sofo).map(key => `${genExists(genQueryString(key, sofo[key]))};`);
  let requestedUserid = '';
  // 별명만, 비밀번호만, 이메일만, 셋 중 둘만, 셋 다 바꾸는 경우 테스트 진행 필요
  // 현재 별명+이메일, 별명+비번+이메일 두 가지 경우는 정상적으로 작동함
  // 비밀번호만 바꾸는 경우는 오류 발생
  prodDB.query(checkQueries.join(''), (err, results) => {
    if (err) throw err;
    console.log(results)
    const repeatedDataIdx = results
    .filter(result => result[0].isExist === 1)
    .map(result => results.indexOf(result));
    if (repeatedDataIdx.length !== 0) {
      const pack = {
        result: false,
        repeatedData: repeatedDataIdx.map(idx => Object.keys(sofo)[idx])
      };
      res.send(pack);
    } else {
      prodDB.query(`select user_id from user_info where user_nick='${reqUser}'`, (err, result) => {
        if (err) throw err;
        requestedUserid = result[0].user_id;
        const updateQueryStr = (key, val, origin) => `update user_info set user_${key}='${val}' where user_id='${origin}';`;
        const updateQuery = Object.keys(sofo).map(key => updateQueryStr(key, sofo[key], requestedUserid));
        updateQuery.push(`rename table user_lib_${reqUser} to user_lib_${sofo.nick};`);
        prodDB.query(updateQuery.join(''), (err, result2) => {
          if (err) throw err;
          res.send('success');
        });
      })
    }
  });
});

/* #################### api 서버 #################### */

passport.use(
  new SteamStrategy(
    {
      returnURL: `https://libmanage-server.herokuapp.com/auth/steam/return`,
      // returnURL: `http://localhost:3001/auth/steam/return`,
      realm: `https://libmanage-server.herokuapp.com/`,
      // realm: `http://localhost:3001/`,
      apiKey: process.env.CYBER
    },
    (identifier, profile, done) => {
      process.nextTick(() => {
        profile.identifier = identifier;
        return done(null, profile);
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use(
  session({
    secret: 'guitar',
    resave: true,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get(
  '/auth/steam',
  passport.authenticate('steam', {
    failureRedirect: '/login',
    session: false
  }),
  (req, res) => {
    res.send('test');
  }
);

app.get(
  '/auth/steam/return',
  passport.authenticate('steam', {
    failureRedirect: '/login',
    session: false
  }),
  (req, res) => {
    // 1. 스팀 로그인 성공 후 사용자 아이디를 반환
    uid = req.user.id;
    // 2. 반환받은 사용자 아이디로 게임 목록 호출, 제목만 추출한 후 알파벳 순 정렬
    // 제목에서 appid로 변경 - url 대조를 위해
    const getOwnedGames = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?include_appinfo=1&include_played_free_games=1&key=${process.env.CYBER}&steamid=${uid}&format=json`;
    axios
      .get(getOwnedGames)
      .then(result => {
        const rawGamesData = result.data.response.games;
        const steamResult = rawGamesData.map(gameDataObj => gameDataObj.appid);
        const sortedTempArr = steamResult.sort((prev, next) =>
          prev < next ? -1 : 1
        );
        // 정렬된 게임 목록을 변수 gameList로 업데이트
        gameList = sortedTempArr;
        statObj.total = gameList.length;
      })
      .then(() => {
        axios
          .post(`https://libmanage-server.herokuapp.com/api/connect`, { execute: 'order66' })
          // .post(`http://localhost:3001/api/connect`, { execute: 'order66' })
          .then(result => {
            apiCredential = result.data;
            res.redirect('https://godcl1623-libmanage.herokuapp.com/api/progress');
            // res.redirect('https://godcl1623.loca.lt/api/progress');
          });
      });
  }
);

app.get('/login', (req, res) => {
  res.send('failed');
});

app.get('/storeLib', (req, res) => {
  const pack = {
    maxGames: gameList.length,
    apiKey: apiCredential
  }
  res.send(pack);
});

app.post('/api/search', (req, res) => {
  const { reqUserInfo } = req.body;
  requestedUser = reqUserInfo.nickname;
  if (requestedUser) {
    console.log('DB write completed. Return to app service.');
    const stores = {
      game: {
        steam: true
      }
    };
    prodDB.query(
      `update user_info set stores=? where user_nick=?`,
      [JSON.stringify(stores), requestedUser],
      (err, result) => {
        if (err) throw err;
        res.send({
          result: true,
          newInfo: {
            ...reqUserInfo,
            stores: {
              ...stores
            }
          }
        });
        statObj.total = 0;
      }
    );
  } else {
    res.redirect('/error/search');
  }
});

app.post('/stat/track', (req, res) => {
  res.send({
    count: String(statObj.count),
    total: String(statObj.total),
    status: String(statObj.status)
  });
});

app.get('/error/search', (req, res) => {
  res.send('<h1>Error has occured. Please try again later.</h1>');
});

// 프론트에서 처리하도록 수정
app.post('/api/connect', (req, res) => {
  if (req.body.execute === 'order66') {
    const cid = `client_id=${process.env.OWLME}`;
    const secret = `client_secret=${process.env.OWLSPELL}`;
    const cred = 'grant_type=client_credentials';
    const address = `https://id.twitch.tv/oauth2/token?${cid}&${secret}&${cred}`;
    axios.post(address).then(response => {
      response.data.cid = process.env.OWLME;
      res.json(response.data);
    });
  }
});

app.post('/meta/search', (req, res) => {
  const { cid, access_token: token } = req.body.pack.apiCred;
  const { maxApiCall, currApiCall } = req.body.pack;
  if (requestedUser === '') {
    requestedUser = req.body.pack.userInfo.nickname;
  }
  const client = igdb(cid, token);
  // 1. 스팀 게임별 고유 id와 IGDB 사이트에 등록된 스팀 url 대조 함수 - IGDB 고유 게임 아이디 이용 예정
  const steamURLSearchQuery = async steamAppId => {
    const response = await client
      .fields(['game'])
      .where(`category = 1 & uid = "${steamAppId}"`)
      .request('/external_games');
    return response;
  };
  // 2. IGDB 아이디를 이용한 게임 메타데이터 검색 함수
  const igdbIDSearch = async igdbID => {
    const response = await client
      .fields(['*'])
      // .search('cyberpunk 2077')
      .where(`id = ${igdbID}`)
      .request('/games');
    return response;
  };
  // 3. 게임 표지 검색 함수
  const coverSearch = async igdbCoverID => {
    const response = await client
      .fields(['image_id'])
      .where(`id = ${igdbCoverID}`)
      .request('/covers');
    return response;
  };
  // 4. IGDB상 저장된 스팀 게임의 url을 기반으로 IGDB 고유 게임 아이디 반환
  const firstFilter = (rawData, filterFunc) =>
    new Promise((resolve, reject) => {
      const temp = [];
      const fail = [];
      console.log('maxApiCall', maxApiCall)
      console.log('currApiCall', currApiCall)
      const startsFrom = 25 * currApiCall;
      const endsAt = currApiCall + 1 === maxApiCall ? rawData.length : 25 * (currApiCall + 1);
      statObj.total = rawData.length;
      rawData.slice(startsFrom, endsAt).forEach((steamAppId, index) => {
        setTimeout(() => {
          filterFunc(steamAppId).then(result => {
            if (result.data[0] === undefined) {
              fail.push(steamAppId);
            } else {
              temp.push(result.data[0].game);
            }
            statObj.count++;
            console.log(
              `Searching for steam URL based on steam app id: ${
                temp.length + fail.length
              }/${rawData.length}`
            );
            if (temp.length + fail.length === endsAt - startsFrom) {
              statObj.total = temp.length;
              statObj.count = 0;
              statObj.status = '3';
              console.log(
                `Search Result: Succeed(${temp.length}), Fail(${fail.length})`
              );
              resolve(temp.sort((prev, next) => prev < next ? -1 : 1));
            }
          });
        }, index * 300);
      });
    });
  // 5. 4에서 검색된 IGDB 고유 아이디를 통한 게임 메타데이터 검색 함수
  const returnMeta = (rawData, filterFunc) =>
    new Promise((resolve, reject) => {
      const temp = [];
      rawData.forEach((igdbID, index) => {
        setTimeout(() => {
          filterFunc(igdbID).then(result => {
            temp.push(result.data[0]);
            statObj.count++;
            console.log(`Searching meta: ${temp.length}/${rawData.length}`);
            if (temp.length === rawData.length) {
              console.log(
                `Searching meta: Search complete. Proceed to next step.`
              );
              const rawMeta = temp.sort((prev, next) =>
                prev.name < next.name ? -1 : 1
              );
              statObj.total = rawMeta.length;
              statObj.count = 0;
              statObj.status = '4';
              resolve(rawMeta);
            }
          });
        }, index * 300);
      });
    });
  // 6. 메타 데이터 가공 함수 - 제목, 표지, url 추출
  const processMeta = (rawData, filterFunc) =>
    new Promise((resolve, reject) => {
      const titles = rawData.map(gameMeta => gameMeta.name);
      const urls = rawData.map(gameMeta => gameMeta.url);
      const coversTemp = rawData.map(gameMeta => gameMeta.cover);
      const covers = [];
      coversTemp.forEach((coverId, index) => {
        setTimeout(() => {
          filterFunc(coverId).then(result => {
            covers.push(result.data[0].image_id);
            statObj.count++;
            console.log(
              `Processing meta: Searching covers: ${covers.length}/${coversTemp.length}`
            );
            if (covers.length === coversTemp.length) {
              statObj.status = '5';
              console.log(
                `Processing meta: Processing complete. Proceed to next step.`
              );
              resolve({ titles, urls, covers, rawData });
            }
          });
        }, index * 300);
      });
    });
  // 7. DB 기록 함수
  const writeToDB = resultObj =>
    new Promise((resolve, reject) => {
      const { titles, urls, covers, rawData } = resultObj;
      const writeDB = () => {
        (() => {
          const columns = 'title, cover, igdb_url, processed, meta';
          // const queryString = `insert into foo (${columns}) values(?, ?, ?, ?)`;
          const queryString = `insert into user_lib_${requestedUser} (${columns}) values(?, ?, ?, ?, ?)`;
          rawData.forEach((data, index) => {
            const values = [
              titles[index],
              covers[index],
              urls[index],
              false,
              JSON.stringify(data)
            ];
            prodDB.query(queryString, values, (err, result) => {
              if (err) {
                throw err;
              } else {
                resolve(true);
              }
            });
          });
          if (currApiCall + 1 === maxApiCall) {
            resolve('done');
          } else {
            resolve('1');
            statObj.status = '1';
            statObj.count = 25 * (currApiCall + 1);
          }
        })();
      };
      prodDB.query(`select * from user_lib_${requestedUser}`, (err, result) => {
        if (err) {
          console.log(err);
          const columns = {
            first: 'libid int not null auto_increment',
            second: 'title text not null',
            third: 'cover text null',
            fourth: 'igdb_url text not null',
            fifth: 'processed char(5) not null',
            sixth: 'meta text not null',
            seventh: 'primary key (libid)'
          };
          const queryString = `
          create table user_lib_${requestedUser} (
            ${columns.first},
            ${columns.second},
            ${columns.third},
            ${columns.fourth},
            ${columns.fifth},
            ${columns.sixth},
            ${columns.seventh}
          );
        `;
          prodDB.query(queryString, (err, result) => {
            if (err) {
              throw err;
            } else {
              writeDB();
            }
          });
        } else {
          writeDB();
        }
      });
    });
  // 실제 검색 실행 코드
  firstFilter(gameList, steamURLSearchQuery)
    .then(gamesInIGDB => returnMeta(gamesInIGDB, igdbIDSearch))
    .then(igdbResult => processMeta(igdbResult, coverSearch))
    // 최종 메타데이터 목록 - igdbResult는 배열, 이 중 name, cover 정보 필요. name은 추출하기만 하면 되는데, cover는 image_id를 별도로 검색해서 받아와야 함
    .then(resultObj => writeToDB(resultObj))
    .then(writeResult => res.send(writeResult))
    .catch(err => console.log(err));
});

app.post('/disconnect', (req, res) => {
  const originalMsg = JSON.parse(req.body.reqUserInfo);
  const { nickname, stores } = originalMsg;
  const { game: gameStoreList } = stores;
  const storeNames = Object.keys(gameStoreList);
  const isStoreAdded = Object.values(gameStoreList);
  // const storeNames = ['steam', 'epic', 'origin', 'ubisoft'];
  // const isStoreAdded = [true, false, false, true]
  const deletedStoresFilter = storeNames
    .map((store, index) => {
      let temp = '';
      if (!isStoreAdded[index]) {
        temp = store;
      }
      return temp;
    })
    .filter(result => result !== '');
  deletedStoresFilter.forEach(store => {
    const queryString = `select * from user_lib_${nickname}`;
    prodDB.query(queryString, (err, result) => {
      console.log('search', err, result);
      if (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') {
          res.send('오류가 발생했습니다.');
        }
      } else {
        const delQueryString = `delete from user_lib_${nickname}`;
        prodDB.query(delQueryString, (err, result) => {
          console.log('del', err, result);
          if (err) {
            throw err;
          } else {
            // 추후 여러 스토어에 대응 가능하도록 수정
            const stores = {
              game: {
                steam: false
              }
            };
            const updateQueryStr = `update user_info set stores=? where user_nick=?`;
            prodDB.query(
              updateQueryStr,
              [JSON.stringify(stores), nickname],
              (err, result) => {
                if (err) {
                  throw err;
                } else {
                  res.send(true);
                }
              }
            );
          }
        });
      }
    });
  });
  // console.log(deletedStoresFilter);
});

app.post('/get/db', (req, res) => {
  // console.log(req.body.reqData)
  console.log(req.body)
  if (req.body.reqData.reqLibs !== undefined) {
    if (req.body.reqData.reqLibs[0]) {
      const [gameStores] = req.body.reqData.reqLibs;
      const { reqUser: nickname } = req.body.reqData;
      if (gameStores !== '') {
        // 추후 스토어 갯수 늘어나면 db 선택식으로 변경하기
        prodDB.query(
          `select title, cover from user_lib_${nickname} order by title asc`,
          (err, result) => {
            if (err) {
              throw err;
            } else {
              res.send(result);
            }
          }
        );
      } else {
        res.send('no_result');
      }
    }
  } else {
    res.send('no_result');
  }
});

app.post('/get/meta', (req, res) => {
  const { reqUser, selTitle, credData } = req.body.reqData;
  const { cid, access_token: token } = credData;
  const client = igdb(cid, token);
  const multiQuerySearch = async (endpoints, valNeed, query) => {
    let queryStr = '';
    let queryData = '';
    if (typeof query === 'object') {
      if (query.length <= 10) {
        queryStr = query.map(
          (que, idx) =>
            `query ${endpoints} "${idx}" { fields ${valNeed};where id=${que}; }`
        );
      } else {
        queryStr = query
          .slice(0, 10)
          .map(
            (que, idx) =>
              `query ${endpoints} "${idx}" { fields ${valNeed};where id=${que}; }`
          );
      }
      queryData = queryStr.join(';');
    } else if (typeof query === 'number') {
      queryData = `query ${endpoints} "0" { fields ${valNeed};where id=${query}; }`;
    }
    const response = await axios({
      url: 'https://api.igdb.com/v4/multiquery',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Client-ID': cid,
        Authorization: `Bearer ${token}`
      },
      data: queryData + ';'
    });
    return response;
  };
  // const eachQuerySearch = async (endpoints, id, field) => {
  //   const response = await client
  //     .fields(`${field}`)
  //     .where(`id=${id}`)
  //     .request(`/${endpoints}`);
  //   return response;
  // };
  prodDB.query(
    `select processed from user_lib_${reqUser} where title="${selTitle}"`,
    (err, result) => {
      if (result[0].processed === 'true') {
        prodDB.query(
          `select meta from user_lib_${reqUser} where title="${selTitle}"`,
          (err, result) => {
            res.send(result[0].meta);
          }
        );
      } else {
        prodDB.query(
          `select meta from user_lib_${reqUser} where title="${selTitle}"`,
          (err, result) => {
            const originalMeta = JSON.parse(result[0].meta);
            // console.log(originalMeta)
            const {
              artworks,
              cover: covers,
              collection: collections,
              release_dates: releaseDates,
              genres,
              name,
              platforms,
              screenshots,
              summary,
              themes,
              videos,
              websites,
              total_rating: totalRating,
              involved_companies: involvedCompanies,
              game_modes: gameModes,
              player_perspectives: playerPerspectives,
              franchises,
              age_ratings: ageRatings
            } = originalMeta;
            const waitQuery = [
              artworks,
              covers,
              collections,
              releaseDates,
              genres,
              platforms,
              screenshots,
              themes,
              videos,
              websites,
              involvedCompanies,
              gameModes,
              playerPerspectives,
              franchises,
              ageRatings
            ];
            const endPoints = [
              'artworks',
              'covers',
              'collections',
              'release_dates',
              'genres',
              'platforms',
              'screenshots',
              'themes',
              'game_videos',
              'websites',
              'involved_companies',
              'game_modes',
              'player_perspectives',
              'franchises',
              'age_ratings'
            ];
            const valNeed = endPoint => {
              const images = ['artworks', 'covers', 'screenshots'];
              let result = '';
              if (images.find(ele => ele === endPoint)) {
                result = 'image_id';
              } else if (endPoint === 'game_videos') {
                result = 'video_id';
              } else if (endPoint === 'release_dates') {
                result = ['human', 'platform'];
              } else if (endPoint === 'websites') {
                result = 'url';
              } else if (endPoint === 'involved_companies') {
                result = ['company', 'developer', 'publisher'];
              } else if (endPoint === 'age_ratings') {
                result = ['category', 'rating'];
              } else {
                result = 'name';
              }
              return result;
            };
            const tempMeta = {};
            const queryMeta = () =>
              new Promise(resolve => {
                waitQuery.forEach((query, queryIdx) => {
                  if (query) {
                    setTimeout(() => {
                      tempMeta[endPoints[queryIdx]] = multiQuerySearch(
                        endPoints[queryIdx],
                        valNeed(endPoints[queryIdx]),
                        query
                      );
                      console.log(
                        endPoints[queryIdx],
                        Object.keys(tempMeta).length
                      );
                      if (Object.keys(tempMeta).length === waitQuery.length) {
                        resolve(true);
                      }
                    }, queryIdx * 260 * query.length);
                  } else {
                    tempMeta[endPoints[queryIdx]] = 'N/A';
                  }
                });
              });
            const processMeta = (keys, vals, tempMeta) =>
              new Promise(resolve => {
                Promise.allSettled(vals).then(res => {
                  res.forEach((ele, idx) => {
                    if (ele.value !== 'N/A') {
                      const temp = [];
                      ele.value.data.forEach(evd => {
                        if (typeof valNeed(keys[idx]) === 'string') {
                          temp.push(evd.result[0][valNeed(keys[idx])]);
                        } else {
                          temp.push(evd.result[0]);
                        }
                        if (temp.length === ele.value.data.length) {
                          tempMeta[keys[idx]] = temp;
                          if (Object.keys(tempMeta).length === keys.length) {
                            resolve(tempMeta);
                          }
                        }
                      });
                    }
                  });
                });
              });
            queryMeta()
              .then(
                res =>
                  new Promise(resolve => {
                    if (res) {
                      const keys = Object.keys(tempMeta);
                      const vals = Object.values(tempMeta);
                      processMeta(keys, vals, tempMeta).then(res =>
                        resolve(res)
                      );
                    }
                  })
              )
              .then(
                res =>
                  new Promise(resolve => {
                    const { release_dates: releaseDates } = res;
                    releaseDates.forEach((rd, idx) => {
                      const { platform } = rd;
                      setTimeout(() => {
                        multiQuerySearch('platforms', 'name', platform).then(
                          result => {
                            rd.platform_name = result.data[0].result[0].name;
                            if (idx === releaseDates.length - 1) {
                              resolve(res);
                            }
                          }
                        );
                      }, idx * 251);
                    });
                  })
              )
              .then(
                res =>
                  new Promise(resolve => {
                    const { involved_companies: involvedCompanies } = res;
                    involvedCompanies.forEach((ic, idx) => {
                      const { company } = ic;
                      setTimeout(() => {
                        multiQuerySearch('companies', 'name', company).then(
                          result => {
                            ic.company_name = result.data[0].result[0].name;
                            if (idx === involvedCompanies.length - 1) {
                              resolve(res);
                            }
                          }
                        );
                      }, idx * 251);
                    });
                  })
              )
              .then(result => {
                const resultMeta = { ...result, name, summary, totalRating };
                prodDB.query(
                  `update user_lib_${reqUser} set meta=?, processed=? where title="${selTitle}"`,
                  [JSON.stringify(resultMeta), 'true'],
                  err => {
                    if (err) {
                      throw err;
                    }
                    prodDB.query(
                      `select meta from user_lib_${reqUser} where title="${selTitle}"`,
                      (err, result) => {
                        if (err) {
                          throw err;
                        }
                        res.send(result[0].meta);
                      }
                    );
                  }
                );
              });
          }
        );
      }
    }
  );
});

app.listen(app.get('port'), () =>
  console.log(`server is running at port ${app.get('port')}`)
);
