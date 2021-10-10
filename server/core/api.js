const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const session = require('express-session');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const axios = require('axios');
const igdb = require('igdb-api-node').default;
const { libDB, db } = require('../custom_modules/db');
const { cyber, owl } = require('../custom_modules/security/fes');

const app = express();
const port = 3003;
let uid = '';
let gameList = '';
let apiCredential = '';
let requestedUser = '';
const statObj = {
  count: 0,
  total: 0,
  status: 1
};

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded());
app.use(helmet(), compression());
libDB.connect();

passport.use(new SteamStrategy({
    returnURL: `http://localhost:${port}/auth/steam/return`,
    realm: `http://localhost:${port}/`,
    apiKey: cyber
  },
  (identifier, profile, done) => {
    process.nextTick(() => {
      profile.identifier = identifier;
      return done(null, profile);
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use(session({
  secret: 'guitar',
  resave: true,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/steam',
  passport.authenticate('steam', {
    failureRedirect: '/login',
    session: false
  }),
  (req, res) => {
    res.send('test')
});

app.get('/auth/steam/return',
  passport.authenticate('steam', {
    failureRedirect: '/login',
    session: false
  }),
  (req, res) => {
    // 1. 스팀 로그인 성공 후 사용자 아이디를 반환
    uid = req.user.id;
    // 2. 반환받은 사용자 아이디로 게임 목록 호출, 제목만 추출한 후 알파벳 순 정렬
    // 제목에서 appid로 변경 - url 대조를 위해
    const getOwnedGames = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?include_appinfo=1&include_played_free_games=1&key=${cyber}&steamid=${uid}&format=json`;
    axios.get(getOwnedGames)
      .then(result => {
        const rawGamesData = result.data.response.games;
        const steamResult = rawGamesData.map(gameDataObj => gameDataObj.appid);
        const sortedTempArr = steamResult.sort((prev, next) => prev < next ? -1 : 1);
        // 정렬된 게임 목록을 변수 gameList로 업데이트
        gameList = sortedTempArr;
        statObj.total = gameList.length;
      })
      .then(() => {
        axios.post(`http://localhost:${port}/api/connect`, { execute: 'order66' })
          .then(result => {
            apiCredential = result.data;
            res.redirect('http://localhost:3000/api/progress');
          })
      })
  }
)

app.get('/login', (req, res) => {
  res.send('failed');
})

app.get('/', (req, res) => {
  res.send('api server');
});

app.post('/test', (req, res) => {
  libDB.query(`select * from dee`, (err, result) => {
    if (err) {
      const columns = {
        first: 'libid int not null auto_increment',
        second: 'title text not null',
        third: 'cover text null',
        fourth: 'igdb_url text not null',
        fifth: 'meta text not null',
        sixth: 'primary key (libid)'
      }
      const queryString = `
        create table dee (
          ${columns.first},
          ${columns.second},
          ${columns.third},
          ${columns.fourth},
          ${columns.fifth},
          ${columns.sixth}
        );
      `;
      libDB.query(queryString, (err, result) => {
        if (err) {
          throw err;
        } else {
          console.log(result);
        }
      })
    } else {
      console.log('result is', result)
    }
  })
});

app.post('/api/search', (req, res) => {
  const { reqUserInfo } = req.body;
  requestedUser = reqUserInfo.nickname;
  axios.post(`http://localhost:${port}/meta_search`, { apiCred: apiCredential })
  .then(searchResult => {
    if (searchResult.data === true) {
      console.log('DB write completed. Return to app service.')
      const stores = {
        game: {
          steam: true
        }
      }
      db.query(`update user_info set stores=? where user_nick=?`,
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
        })
      })
    } else {
      res.redirect('/error/search');
    }
  })
})

app.post('/stat/track', (req, res) => {
  res.send({
    count: String(statObj.count),
    total: String(statObj.total),
    status: String(statObj.status)
  });
})

app.get('/error/search', (req, res) => {
  res.send('<h1>Error has occured. Please try again later.</h1>')
});

// 프론트에서 처리하도록 수정
app.post('/api/connect', (req, res) => {
  if (req.body.execute === 'order66') {
    const cid = `client_id=${owl.me}`;
    const secret = `client_secret=${owl.spell}`;
    const cred = 'grant_type=client_credentials';
    const address = `https://id.twitch.tv/oauth2/token?${cid}&${secret}&${cred}`;
    axios.post(address)
      .then(response => {
        response.data.cid = owl.me;
        res.json(response.data)
      });
  }
});

app.post('/meta_search', (req, res) => {
  // const tempList = [1210030, 1222140, 1254120, 1286830, 1289310];
  const { cid, access_token: token } = req.body.apiCred;
  const client = igdb(cid, token);
  // 1. 스팀 게임별 고유 id와 IGDB 사이트에 등록된 스팀 url 대조 함수 - IGDB 고유 게임 아이디 이용 예정
  const steamURLSearchQuery = async steamAppId => {
    const response = await client
      .fields(['*'])
      .where(`category = 13 & url = *"/${steamAppId}"`)
      .request('/websites');
    return response;
  };
  // 2. 스팀 url 중 1과 다른 형식의 게임들 검색 함수 - IGDB 고유 게임 아이디 이용 예정
  const steamURLException = async steamAppId => {
    const response = await client
      .fields(['*'])
      .where(`category = 13 & url = *"/${steamAppId}/"*`)
      .request('/websites');
    return response;
  };
  // 3. IGDB 아이디를 이용한 게임 메타데이터 검색 함수
  const igdbIDSearch = async igdbID => {
    const response = await client
      .fields(['*'])
      // .search('cyberpunk 2077')
      .where(`id = ${igdbID}`)
      .request('/games');
    return response;
  };
  // 4. 게임 표지 검색 함수
  const coverSearch = async igdbCoverID => {
    const response = await client
      .fields(['*'])
      .where(`id = ${igdbCoverID}`)
      .request('/covers');
    return response;
  };
  // 5. IGDB상 저장된 스팀 게임의 url을 기반으로 IGDB 고유 게임 아이디 반환
  const firstFilter = (rawData, filterFunc) => new Promise((resolve, reject) => {
    const temp = [];
    const fail = [];
    statObj.total = rawData.length;
    // rawData.slice(rawData.length - 30,rawData.length).forEach((steamAppId, index) => {
    // rawData.slice(0 - 5).forEach((steamAppId, index) => {
    rawData.forEach((steamAppId, index) => {
      setTimeout(() => {
        filterFunc(steamAppId)
          .then(result => {
            if (result.data[0] === undefined) {
              fail.push(steamAppId);
            } else {
              temp.push(result.data[0].game);
              // 기능 완성 이후 삭제할 것
            }
            statObj.count++;
            console.log(`Searching for steam URL based on steam app id: ${temp.length + fail.length}/${rawData.length}`);
            // if (temp.length + fail.length === 30) {
            // if (temp.length + fail.length === 5) {
            if (temp.length + fail.length === rawData.length) {
              statObj.total = fail.length;
              statObj.count = 0;
              statObj.status = '2';
              console.log(`First attempt: Succeed(${temp.length}), Fail(${fail.length})`)
              resolve({ temp, fail });
            }
          });
      }, index * 300);
    });
  });
  // 6. 5에서 검색에 실패한 게임들 대상 IGDB 고유 게임 아이디 검색 함수
  const secondFilter = (rawData, filterFunc) => new Promise((resolve, reject) => {
    const { temp, fail } = rawData;
    const secTemp = [];
    const secFail = [];
    if (fail[0] !== undefined) {
      fail.forEach((steamAppId, index, thisArr) => {
        setTimeout(() => {
          filterFunc(steamAppId)
            .then(result => {
              if (result.data[0] === undefined && thisArr.includes(steamAppId)) {
                secFail.push(steamAppId);
              // eslint-disable-next-line no-else-return
              } else {
                secTemp.push(result.data[0].game);
                // 기능 구현 이후에 삭제할 것
              }
              statObj.count++;
              console.log(`Searching for steam URL from steam app id failed on first attempt: ${secTemp.length + secFail.length}/${fail.length}`);
              if (secTemp.length + secFail.length === thisArr.length) {
                console.log(`Second attempt: Succeed(${secTemp.length}), Fail(${secFail.length})`)
                const totalSuccess = temp.concat(secTemp).sort((prev, next) => prev < next ? -1 : 1);
                statObj.total = totalSuccess.length;
                statObj.count = 0;
                statObj.status = '3';
                resolve(totalSuccess);
              }
            });
        }, index * 300);
      });
    } else {
      console.log(`Second attempt: No fails detected. Proceed to next step.`)
      resolve(temp);
    }
  });
  // 7. 5, 6에서 검색된 IGDB 고유 아이디를 통한 게임 메타데이터 검색 함수
  const returnMeta = (rawData, filterFunc) => new Promise((resolve, reject) => {
    const temp = [];
    rawData.forEach((igdbID, index) => {
      setTimeout(() => {
        filterFunc(igdbID)
          .then(result => {
            temp.push(result.data[0]);
            statObj.count++;
            console.log(`Searching meta: ${temp.length}/${rawData.length}`);
            if (temp.length === rawData.length) {
              console.log(`Searching meta: Search complete. Proceed to next step.`)
              const rawMeta = temp.sort((prev, next) => prev.name < next.name ? -1 : 1)
              statObj.total = rawMeta.length;
              statObj.count = 0;
              statObj.status = '4';
              resolve(rawMeta);
            }
          });
      }, index * 300);
    });
  });
  // 8. 메타 데이터 가공 함수 - 제목, 표지, url 추출
  const processMeta = (rawData, filterFunc) => new Promise((resolve, reject) => {
    const titles = rawData.map(gameMeta => gameMeta.name);
    const urls = rawData.map(gameMeta => gameMeta.url);
    const coversTemp = rawData.map(gameMeta => gameMeta.cover);
    const covers = [];
    coversTemp.forEach((coverId, index) => {
      setTimeout(() => {
        filterFunc(coverId)
          .then(result => {
            covers.push(result.data[0].image_id);
            statObj.count++;
            console.log(`Processing meta: Searching covers: ${covers.length}/${coversTemp.length}`)
            if (covers.length === coversTemp.length) {
              statObj.status = '5';
              console.log(`Processing meta: Processing complete. Proceed to next step.`);
              resolve({ titles, urls, covers, rawData });
            };
          });
      }, index * 300);
    });
  });
  // 9. DB 기록 함수
  const writeToDB = resultObj => new Promise((resolve, reject) => {
    const { titles, urls, covers, rawData } = resultObj;
    const writeDB = () => {
      (() => {
        const columns = 'title, cover, igdb_url, meta';
        // const queryString = `insert into foo (${columns}) values(?, ?, ?, ?)`;
        const queryString = `insert into ${requestedUser} (${columns}) values(?, ?, ?, ?)`;
        rawData.forEach((data, index) => {
          const values = [titles[index], covers[index], urls[index], JSON.stringify(data)];
          libDB.query(queryString, values, (err, result) => {
            if (err) {
              throw err;
            } else {
              resolve(true);
            }
          });
        });
      })();
    };
    libDB.query(`select * from ${requestedUser}`, (err, result) => {
    // libDB.query(`select * from foo`, (err, result) => {
      if (err) {
        console.log(err)
        const columns = {
          first: 'libid int not null auto_increment',
          second: 'title text not null',
          third: 'cover text null',
          fourth: 'igdb_url text not null',
          fifth: 'meta text not null',
          sixth: 'primary key (libid)'
        }
        const queryString = `
          create table ${requestedUser} (
            ${columns.first},
            ${columns.second},
            ${columns.third},
            ${columns.fourth},
            ${columns.fifth},
            ${columns.sixth}
          );
        `;
        libDB.query(queryString, (err, result) => {
          if (err) {
            throw err;
          } else {
            writeDB();
          }
        })
      } else {
        writeDB();
      }
    });
  });
  // 실제 검색 실행 코드
  firstFilter(gameList, steamURLSearchQuery)
  // firstFilter(tempList, steamURLSearchQuery)
    .then(rawURLSearchResult => secondFilter(rawURLSearchResult, steamURLException))
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
    const queryString = `select * from ${nickname}`;
    libDB.query(queryString, (err, result) => {
      console.log('search', err, result);
      if (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') {
          res.send('오류가 발생했습니다.');
        }
      } else {
        const delQueryString = `delete from ${nickname}`;
        libDB.query(delQueryString, (err, result) => {
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
            db.query(updateQueryStr, [JSON.stringify(stores), nickname], (err, result) => {
              if (err) {
                throw err;
              } else {
                res.send(true);
              }
            });
          }
        });
      }
    });
  });
  // console.log(deletedStoresFilter);
});

app.post('/get/db', (req, res) => {
  // console.log(req.body.reqData)
  const [gameStores] = req.body.reqData.reqLibs;
  const { reqUser: nickname } = req.body.reqData;
  if (gameStores !== '') {
    // 추후 스토어 갯수 늘어나면 db 선택식으로 변경하기
    libDB.query(`select title, cover from ${nickname}`, (err, result) => {
      if (err) {
        throw err;
      } else {
        res.send(result);
      }
    })
  } else {
    res.send('pending');
  }
});

app.post('/get/meta', (req, res) => {
  const { reqUser, selTitle } = req.body.reqData;
  libDB.query(`select meta from ${reqUser} where title="${selTitle}"`, (err, result) => {
    console.log(JSON.parse(result[0].meta));
  })
});

app.listen(port, () => console.log(`server is running at port${port}`));