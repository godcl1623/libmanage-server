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
const { libDB } = require('../custom_modules/db');
const { cyber, blade, owl } = require('../custom_modules/security/fes');

const app = express();
const port = 3003;
let uid = '';
let gameList = '';
let testObj = '';
let count = 0;
let total = 0;

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
        total = gameList.length;
        // console.log(gameList);
      })
      .then(() => {
        axios.post(`http://localhost:${port}/api_connect`, { execute: 'order66' })
          .then(result => {
            // axios.post(`http://localhost:${port}/meta_search`, { test: result.data })
            //   .then(searchResult => {
            //     if (searchResult.data === true) {
            //       console.log('DB write completed. Return to app service.')
            //       res.redirect('http://localhost:3000/main');
            //     } else {
            //       res.redirect('/error/search');
            //     }
            //   })
            testObj = result.data;
            res.redirect('http://localhost:3000/test/test4')
          })
      })
      // .then(() => res.redirect('http://localhost:3000/main'));
  }
)

app.get('/login', (req, res) => {
  res.send('failed');
})

// app.get('/logout', (req, res) => {
//   req.logout();
//   res.redirect('/');
// })

app.get('/', (req, res) => {
  res.send('api server');
});

app.get('/test', (req, res) => {
  // res.send(test)
  res.send(uid);
});

app.post('/test', (req, res) => {
  // res.send('foo');
  axios.post(`http://localhost:${port}/meta_search`, { test: testObj })
  .then(searchResult => {
    if (searchResult.data === true) {
      console.log('DB write completed. Return to app service.')
      // res.redirect('http://localhost:3000/main');
      res.send(true)
    } else {
      res.redirect('/error/search');
    }
  })
})

app.post('/test2', (req, res) => {
  res.send({
    count: String(count),
    total: String(total)
  });
})

app.get('/error/search', (req, res) => {
  res.send('<h1>Error has occured. Please try again later.</h1>')
});

// 프론트에서 처리하도록 수정
app.post('/api_connect', (req, res) => {
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
  const { cid, access_token: token } = req.body.test;
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
    total = rawData.length;
    // rawData.slice(0,5).forEach((steamAppId, index) => {
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
            count++;
            console.log(`Searching for steam URL based on steam app id: ${temp.length + fail.length}/${rawData.length}`);
            // if (temp.length + fail.length === 5) {
            if (temp.length + fail.length === rawData.length) {
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
              console.log(`Searching for steam URL from steam app id failed on first attempt: ${secTemp.length + secFail.length}/${fail.length}`);
              if (secTemp.length + secFail.length === thisArr.length) {
                console.log(`Second attempt: Succeed(${secTemp.length}), Fail(${secFail.length})`)
                resolve(temp.concat(secTemp).sort((prev, next) => prev < next ? -1 : 1));
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
            console.log(`Searching meta: ${temp.length}/${rawData.length}`);
            if (temp.length === rawData.length) {
              console.log(`Searching meta: Search complete. Proceed to next step.`)
              resolve(temp.sort((prev, next) => prev.name < next.name ? -1 : 1));
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
            console.log(`Processing meta: Searching covers: ${covers.length}/${coversTemp.length}`)
            if (covers.length === coversTemp.length) {
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
    const columns = 'title, cover, igdb_url, meta';
    const queryString = `insert into DB_SAVE_TEST (${columns}) values(?, ?, ?, ?)`;
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
  });
  // 실제 검색 실행 코드
  firstFilter(gameList, steamURLSearchQuery)
  .then(rawURLSearchResult => secondFilter(rawURLSearchResult, steamURLException))
  .then(gamesInIGDB => returnMeta(gamesInIGDB, igdbIDSearch))
  .then(igdbResult => processMeta(igdbResult, coverSearch))
  // 최종 메타데이터 목록 - igdbResult는 배열, 이 중 name, cover 정보 필요. name은 추출하기만 하면 되는데, cover는 image_id를 별도로 검색해서 받아와야 함
  .then(resultObj => writeToDB(resultObj))
  .then(writeResult => res.send(writeResult))
  .catch(err => console.log(err));
});

app.listen(port, () => console.log(`server is running at port${port}`));