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
const WebSocketServer = require('ws').Server;
require('dotenv').config();
const { dbProdOptions, prodDB } = require('./custom_modules/db');
const { encryptor, decryptor } = require('./custom_modules/aeser');
const { getRandom } = require('./custom_modules/utils');

const app = express();
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

app.get('/', (req, res) => {
  res.send('backend server connected');
});

app.post('/login_process', async (req, res) => {
  loginInfo = decryptor(req.body.sofo, process.env.TRACER);
  if (loginInfo.ID.length > 0 && loginInfo.PWD.length > 0) {
    try {
      loginInfo.salt = bcrypt.getSalt(loginInfo.PWD);
      const [rows, fields] = await prodDB.query(
        'select * from user_info where user_id=?',
        [loginInfo.ID]
      );
      if (rows[0] === undefined) {
        res.send('등록되지 않은 ID입니다.');
      } else {
        [dbInfo] = rows;
        const comparison = bcrypt.hashSync(dbInfo.user_pwd, loginInfo.salt);
        if (loginInfo.ID === dbInfo.user_id && loginInfo.PWD === comparison) {
          req.session.loginInfo = {
            isLoginSuccessful: true,
            nickname: dbInfo.user_nick,
            isGuest: false,
            sid: req.sessionID
          };
          if (dbInfo.stores) {
            req.session.loginInfo.stores = { ...JSON.parse(dbInfo.stores) };
          }
          if (dbInfo.options) {
            req.session.loginInfo.customCatOrder = dbInfo.options;
          }
          res.send(req.session.loginInfo);
        } else {
          res.send('ID 혹은 비밀번호가 잘못됐습니다.');
        }
      }
    } catch (error) {
      throw new Error(error);
    }
  } else if (loginInfo.mode === 'guest') {
    const newGuest = `guest#${getRandom()}`;
    req.session.loginInfo = {
      isLoginSuccessful: true,
      nickname: newGuest,
      isGuest: true,
      sid: req.sessionID
    };
    res.send(req.session.loginInfo);
  } else {
    res.send('ID와 비밀번호를 입력해주세요.');
  }
});

app.post('/logout_process', (req, res) => {
  const { reqMsg, million } = req.body.message;
  if (reqMsg === 'logout') {
    const sentOne = JSON.parse(decryptor(million, process.env.TRACER));
    const { sid } = sentOne;
    const logoutInfo = {
      isLoginSuccessful: false,
      nickname: ''
    };
    req.session.destroy(async () => {
      try {
        const [rows] = await prodDB.query(
          'delete from sessions where session_id=?',
          [sid]
        );
        if (rows) {
          res.send(logoutInfo);
        }
      } catch (error) {
        throw new Error(error);
      }
    });
  }
});

app.post('/check_login', async (req, res) => {
  const { comparisonState, million } = req.body.message;

  if (million == null) {
    res.send('no_sessions');
  } else {
    try {
      const sentOne = JSON.parse(decryptor(million, process.env.TRACER));
      const [sessionQueryResult] = await prodDB.query(
        `select * from sessions where session_id=?`,
        [sentOne.sid]
      );
      if (sessionQueryResult[0]) {
        try {
          const { data } = sessionQueryResult[0];
          const gotOne = JSON.parse(data);
          const thatTime = new Date(gotOne.cookie.expires);
          const thisTime = new Date();
          if (thisTime - thatTime > 0) {
            const [deleteSessionResult] = await prodDB.query(
              'delete from sessions where session_id=?',
              [sentOne.sid]
            );
            if (deleteSessionResult) {
              res.send('session_expired');
            }
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
              const [updateSessionResult] = await prodDB.query(
                'update sessions set data=? where session_id=?',
                [compare, sentOne.sid]
              );
              if (updateSessionResult) {
                res.send(newSession.loginInfo);
              }
            } else {
              res.send(gotOne.loginInfo);
            }
          } else if (gotOne.loginInfo) {
            res.send(gotOne.loginInfo);
          } else {
            const [deleteSessionResult] = await prodDB.query(
              'delete from sessions where session_id=?',
              [sentOne.sid]
            );
            if (deleteSessionResult) {
              res.send('check_failed');
            }
          }
        } catch (error) {
          throw new Error(error);
        }
      } else {
        res.send('session_expired');
      }
    } catch (error) {
      throw new Error(error);
    }
  }
});

app.post('/member/register', async (req, res) => {
  try {
    const transmitted = decryptor(req.body.foo, process.env.TRACER);
    const temp = {};
    const genQueryString = string =>
      `select mid from user_info where ${string}=?`;
    const genExists = qString =>
      `select exists (${qString} limit 1) as isExist`;
    const [overlapsQueryResult] = await prodDB.query(
      `
        ${genExists(genQueryString('user_id'))};
        ${genExists(genQueryString('user_nick'))};
        ${genExists(genQueryString('user_email'))};
      `,
      [transmitted.id, transmitted.nick, transmitted.email]
    );
    const checkResult = overlapsQueryResult.map(packet => packet[0].isExist);
    if (!checkResult.includes(1)) {
      const column = 'user_id, user_pwd, user_nick, user_email, created';
      const queryString = `insert into user_info (${column}) values(?, ?, ?, ?, now())`;
      const values = [
        transmitted.id,
        transmitted.pwd,
        transmitted.nick,
        transmitted.email
      ];
      const [insertResult] = await prodDB.query(queryString, values);
      console.log(insertResult);
      if (insertResult) {
        res.send('success');
      }
    } else {
      [temp.id, temp.nick, temp.email] = checkResult;
      res.send(encryptor(temp, process.env.TRACER));
    }
  } catch (error) {
    throw new Error(error);
  }
});

app.post('/member/find/id', async (req, res) => {
  try {
    const { nick: queryNick, email: queryEmail } = decryptor(
      req.body.infoObj,
      process.env.TRACER
    );
    const [emailQueryResult] = await prodDB.query(
      'select user_nick, user_id from user_info where user_email=?',
      [queryEmail]
    );
    if (emailQueryResult[0] !== undefined) {
      const nickMatchesWithEmail = emailQueryResult[0].user_nick;
      if (queryNick === nickMatchesWithEmail) {
        const subject = '아이디 찾기 요청 결과입니다.';
        const html = `
              <p>안녕하세요 ${nickMatchesWithEmail}님,<br>
              요청하신 아이디는 다음과 같습니다.</p>
              <p>아이디: ${emailQueryResult[0].user_id}</p>
              <p>비밀번호를 찾으시려면 아래 링크를 클릭해주세요.</p>
              <p><a href="${process.env.CLIENT_ADDRESS}/member/find/pwd">링크</a></p>
            `;
        const successMsg = '메일이 발송되었습니다.\n메세지 함을 확인해주세요.';
        const emailOptions = genEmailOptions(
          `관리자 <${process.env.SWALLOWAC}>`,
          queryEmail,
          subject,
          html
        );
        transporter.sendMail(emailOptions, (err, info) => {
          if (err) {
            res.send('오류가 발생했습니다');
          }
          res.send(successMsg);
        });
      } else {
        res.send('가입된 정보와 일치하지 않습니다.');
      }
    } else {
      res.send('가입되지 않은 이메일 주소입니다.');
    }
  } catch (error) {
    throw new Error(error);
  }
});

app.post('/member/find/pwd', async (req, res) => {
  try {
    const { id: queryId, email: queryEmail } = decryptor(
      req.body.infoObj,
      process.env.TRACER
    );
    const genQueryString = string =>
      `select user_nick from user_info where ${string}=?`;
    const [idEmailQueryResult] = await prodDB.query(
      `
        ${genQueryString('user_id')};
        ${genQueryString('user_email')};
      `,
      [queryId, queryEmail]
    );
    if (
      idEmailQueryResult[0][0] !== undefined &&
      idEmailQueryResult[1][0] !== undefined
    ) {
      const nickFromId = idEmailQueryResult[0][0].user_nick;
      const nickFromEmail = idEmailQueryResult[1][0].user_nick;
      if (nickFromId === nickFromEmail) {
        const token = crypto.randomBytes(64).toString('hex');
        const authData = {
          token,
          userId: queryId,
          ttl: 300
        };
        const timeStamp = () => {
          const today = new Date();
          today.setHours(today.getHours() + 9);
          return today.toISOString().replace('T', ' ').substring(0, 19);
        };
        await prodDB.query(
          'insert into user_token (token_body, created) values(?, ?)',
          [JSON.stringify(authData), timeStamp()]
        );
        const subject = '비밀번호 찾기 요청 결과입니다.';
        const html = `
              <p>안녕하세요 ${nickFromId}님,<br>
              비밀번호 초기화 안내 메일을 보내드립니다.</p>
              <p>비밀번호를 초기화하시려면 아래 링크를 클릭해주세요.</p>
              <p><a href="${process.env.CLIENT_ADDRESS}/member/reset/${token}">링크</a></p>
            `;
        const emailOptions = genEmailOptions(
          `관리자 <${process.env.SWALLOWAC}>`,
          queryEmail,
          subject,
          html
        );
        transporter.sendMail(emailOptions, (err, info) => {
          if (err) {
            res.send('오류가 발생했습니다');
          }
          res.send('메일이 발송되었습니다.\n메세지 함을 확인해주세요.');
        });
      } else {
        res.send('가입된 정보와 일치하지 않습니다.');
      }
    } else {
      res.send('입력된 정보를 다시 확인해주세요.');
    }
  } catch (error) {
    throw new Error(error);
  }
});

app.post('/member/reset', async (req, res) => {
  try {
    const { tokenTail, requestedTime } = decryptor(
      req.body.postData,
      process.env.TRACER
    );
    if (tokenTail && requestedTime) {
      const [tokenQueryResult] = await prodDB.query(
        'select * from user_token where token_body like ?',
        [`%${tokenTail}%`]
      );
      if (tokenQueryResult[0] !== undefined) {
        const requestedToken = JSON.parse(tokenQueryResult[0].token_body);
        requestedToken.tokenId = tokenQueryResult[0].req_id;
        const createdTime = tokenQueryResult[0].created;
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
    } else {
      res.send({
        tokenState: 'abnormal'
      });
    }
  } catch (error) {
    throw new Error(error);
  }
});

app.post('/member/reset/pwd', async (req, res) => {
  try {
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
        const [passwordUpdateResult] = await prodDB.query(
          'update user_info set user_pwd=? where user_id=?',
          [newPwd, userId]
        );
        console.log(passwordUpdateResult.changedRows);
        if (passwordUpdateResult.changedRows) {
          const [tokenDeleteResult] = await prodDB.query(
            'delete from user_token where req_id=?',
            [tokenId]
          );
          if (tokenDeleteResult.affectedRows) {
            res.send('complete');
          } else {
            res.send('error');
          }
        }
      } else {
        const [tokenExpiredResult] = await prodDB.query(
          'delete from user_token where req_id=?',
          [tokenId]
        );
        if (tokenExpiredResult.affectedRows) {
          res.send('expired');
        } else {
          res.send('error');
        }
      }
    } else {
      res.send('error');
    }
  } catch (error) {
    throw new Error(error);
  }
});

app.post('/verify', (req, res) => {
  const { sofo } = req.body;
  const { NICK, PWD } = decryptor(sofo, process.env.TRACER);
  prodDB.query(
    'select user_pwd from user_info where user_nick=?',
    [NICK],
    (err, result) => {
      if (err) throw err;
      const dbPwd = result[0].user_pwd;
      const verifySalt = bcrypt.getSalt(PWD);
      const comparison = bcrypt.hashSync(dbPwd, verifySalt);
      if (PWD === comparison) {
        res.send(true);
      } else {
        res.send(false);
      }
    }
  );
});

app.put('/member/modify_option', (req, res) => {
  const originalPackage = decryptor(req.body.pack, process.env.TRACER);
  const modedUserInfo = JSON.parse(originalPackage);
  prodDB.query(
    'update user_info set `options`=? where user_nick=?',
    [modedUserInfo.customCatOrder, modedUserInfo.nickname],
    err => {
      if (err) {
        res.send(false);
        throw err;
      } else {
        res.send(true);
      }
    }
  );
});

app.put('/member/update', (req, res) => {
  const { sofo, reqUser } = decryptor(req.body.foo, process.env.TRACER);
  const genQueryString = (key, val) =>
    `select mid from user_info where user_${key}='${val}'`;
  const genExists = qString => `select exists (${qString} limit 1) as isExist`;
  const checkQueries = Object.keys(sofo).map(
    key => `${genExists(genQueryString(key, sofo[key]))};`
  );
  let requestedUserid = '';
  prodDB.query(checkQueries.join(''), (err, results) => {
    if (err) throw err;
    const repeatedDataIdx =
      results.length !== 1
        ? results
            .filter(result => result[0].isExist === 1)
            .map(result => results.indexOf(result))
        : results
            .filter(result => result.isExist === 1)
            .map(result => results.indexOf(result));
    if (
      repeatedDataIdx.length !== 0 &&
      Object.keys(sofo).length === 1 &&
      Object.keys(sofo)[0] !== 'pwd'
    ) {
      const pack = {
        result: false,
        repeatedData: repeatedDataIdx.map(idx => Object.keys(sofo)[idx])
      };
      res.send(pack);
    } else {
      prodDB.query(
        `select user_id from user_info where user_nick='${reqUser}'`,
        (err, result) => {
          if (err) throw err;
          requestedUserid = result[0].user_id;
          const updateQueryStr = (key, val, origin) =>
            `update user_info set user_${key}='${val}' where user_id='${origin}';`;
          const updateQuery = Object.keys(sofo).map(key =>
            updateQueryStr(key, sofo[key], requestedUserid)
          );
          if (sofo.nick) {
            updateQuery.push(
              `rename table user_lib_${reqUser} to user_lib_${sofo.nick};`
            );
          }
          console.log(updateQuery);
          prodDB.query(updateQuery.join(''), (err, result2) => {
            if (err) {
              if (err.code === 'ER_FILE_NOT_FOUND') {
                res.send('success');
              } else {
                throw err;
              }
            } else {
              res.send('success');
            }
          });
        }
      );
    }
  });
});

app.delete('/member', (req, res) => {
  const reqUser = decryptor(req.body.reqUser, process.env.TRACER);
  const whereCond = `table_schema='${process.env.MYSQLDATABASE}'`;
  const tableNameCond = `table_name='user_lib_${reqUser}'`;
  const tableCheckQuery = `select 1 from Information_schema.tables where ${whereCond} and ${tableNameCond}`;
  const delUserInfo = (reqUser, res) => {
    prodDB.query(
      `delete from user_info where user_nick='${reqUser}'`,
      (err, result) => {
        if (err) throw err;
        res.send('success');
      }
    );
  };
  prodDB.query(`select exists (${tableCheckQuery}) as flag`, (err, result) => {
    if (err) throw err;
    if (result[0].flag === 1) {
      prodDB.query(`drop table user_lib_${reqUser}`, (err, result2) => {
        if (err) {
          throw err;
        } else {
          delUserInfo(reqUser, res);
        }
      });
    } else {
      delUserInfo(reqUser, res);
    }
  });
});

/* #################### api 서버 #################### */

passport.use(
  new SteamStrategy(
    {
      returnURL: `${process.env.SERVER_ADDRESS}/auth/steam/return`,
      realm: `${process.env.SERVER_ADDRESS}/`,
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
    uid = req.user.id;
    const getOwnedGames = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?include_appinfo=1&include_played_free_games=1&key=${process.env.CYBER}&steamid=${uid}&format=json`;
    axios
      .get(getOwnedGames)
      .then(result => {
        const rawGamesData = result.data.response.games;
        const steamResult = rawGamesData.map(gameDataObj => gameDataObj.appid);
        const sortedTempArr = steamResult.sort((prev, next) =>
          prev < next ? -1 : 1
        );
        gameList = sortedTempArr;
        statObj.total = gameList.length;
      })
      .then(() => {
        axios
          .post(`${process.env.SERVER_ADDRESS}/api/connect`, {
            execute: 'order66'
          })
          .then(result => {
            apiCredential = result.data;
            res.redirect(`${process.env.CLIENT_ADDRESS}/api/progress`);
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
  };
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

app.get('/error/search', (req, res) => {
  res.send('<h1>Error has occured. Please try again later.</h1>');
});

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
  const steamURLSearchQuery = async steamAppId => {
    const response = await client
      .fields(['game'])
      .where(`category = 1 & uid = "${steamAppId}"`)
      .request('/external_games');
    return response;
  };
  const igdbIDSearch = async igdbID => {
    const response = await client
      .fields(['*'])
      .where(`id = ${igdbID}`)
      .request('/games');
    return response;
  };
  const coverSearch = async igdbCoverID => {
    const response = await client
      .fields(['image_id'])
      .where(`id = ${igdbCoverID}`)
      .request('/covers');
    return response;
  };
  const firstFilter = (rawData, filterFunc) =>
    new Promise((resolve, reject) => {
      const temp = [];
      const fail = [];
      const startsFrom = 25 * currApiCall;
      const endsAt =
        currApiCall + 1 === maxApiCall
          ? rawData.length
          : 25 * (currApiCall + 1);
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
              resolve(temp.sort((prev, next) => (prev < next ? -1 : 1)));
            }
          });
        }, index * 300);
      });
    });
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
  const writeToDB = resultObj =>
    new Promise((resolve, reject) => {
      const { titles, urls, covers, rawData } = resultObj;
      const writeDB = () => {
        (() => {
          const columns = 'title, cover, igdb_url, processed, meta';
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
            statObj.status = '1';
            statObj.count = 25 * (currApiCall + 1);
            resolve('1');
          }
        })();
      };
      prodDB.query(`select * from user_lib_${requestedUser}`, (err, result) => {
        if (err) {
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
  firstFilter(gameList, steamURLSearchQuery)
    .then(gamesInIGDB => returnMeta(gamesInIGDB, igdbIDSearch))
    .then(igdbResult => processMeta(igdbResult, coverSearch))
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
      if (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') {
          res.send('오류가 발생했습니다.');
        }
      } else {
        const delQueryString = `drop table user_lib_${nickname}`;
        prodDB.query(delQueryString, (err, result) => {
          if (err) {
            throw err;
          } else {
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
});

app.post('/get/db', (req, res) => {
  if (req.body.reqData.reqLibs !== undefined) {
    if (req.body.reqData.reqLibs[0]) {
      const [gameStores] = req.body.reqData.reqLibs;
      const { reqUser: nickname } = req.body.reqData;
      if (gameStores !== '') {
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
                result = ['category', 'url'];
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
                      if (Object.keys(tempMeta).length === waitQuery.length) {
                        resolve(true);
                      }
                    }, queryIdx * 260 * query.length);
                  } else {
                    tempMeta[endPoints[queryIdx]] = ['N/A'];
                  }
                });
              });
            const processMeta = (keys, vals, tempMeta) =>
              new Promise(resolve => {
                Promise.allSettled(vals).then(res => {
                  res.forEach((ele, idx) => {
                    if (ele.value[0] !== 'N/A') {
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

const server = app.listen(app.get('port'), () =>
  console.log(`server is running at port ${app.get('port')}`)
);

const wss = new WebSocketServer({ server });
wss.on('connection', ws => {
  console.log('connected');
  let timer = '';
  ws.on('message', msg => {
    if (msg.toString() === 'client_connected') {
      timer = setInterval(
        () =>
          ws.send(
            JSON.stringify({
              count: String(statObj.count),
              total: String(statObj.total),
              status: String(statObj.status)
            })
          ),
        100
      );
    }
  });
  ws.on('close', () => {
    console.log('closed');
    ws.close();
    clearInterval(timer);
  });
});
