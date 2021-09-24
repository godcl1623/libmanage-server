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
const { db, dbOptions } = require('../custom_modules/db');
const { cyber, blade, owl } = require('../custom_modules/security/fes');

const app = express();
const port = 3003;
let uid = '';
let gameList = '';

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded());
app.use(helmet(), compression());
db.connect();

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
        gameList = sortedTempArr
        // console.log(gameList);
      })
      .then(() => {
        axios.post(`http://localhost:${port}/api_connect`, { execute: 'order66' })
          .then(result => {
            axios.post(`http://localhost:${port}/meta_search`, { test: result.data })
              .then(res => console.log(res))
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
  // 4. IGDB상 저장된 스팀 게임의 url을 기반으로 IGDB 고유 게임 아이디 반환
  const firstFilter = (rawData, filterFunc) => new Promise((resolve, reject) => {
    const temp = [];
    const fail = [];
    rawData.forEach((steamAppId, index) => {
      setTimeout(() => {
        filterFunc(steamAppId)
          .then(result => {
            if (result.data[0] === undefined) {
              fail.push(steamAppId);
            } else {
              temp.push(result.data[0].game);
              // 기능 완성 이후 삭제할 것
              console.log(temp.length + fail.length);
            }
            if (temp.length + fail.length === rawData.length) {
              resolve({ temp, fail });
            }
          });
      }, index * 300);
    });
  });
  // 5. 4에서 검색에 실패한 게임들 대상 IGDB 고유 게임 아이디 검색 함수
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
                console.log(secTemp.length + secFail.length);
              }
              if (secTemp.length + secFail.length === thisArr.length) {
                resolve(temp.concat(secTemp).sort((prev, next) => prev < next ? -1 : 1));
              }
            });
        }, index * 300);
      });
    } else {
      resolve(temp);
    }
  });
  // 6. 4, 5에서 검색된 IGDB 고유 아이디를 통한 게임 메타데이터 검색 함수
  const returnMeta = (rawData, filterFunc) => new Promise((resolve, reject) => {
    const temp = [];
    rawData.forEach((igdbID, index) => {
      setTimeout(() => {
        filterFunc(igdbID)
          .then(result => {
            temp.push(result.data[0]);
            console.log(temp.length);
            if (temp.length === rawData.length) resolve(temp);
          });
      }, index * 300);
    });
  });
  // 실제 검색 실행 코드
  firstFilter(gameList, steamURLSearchQuery)
    .then(rawURLSearchResult => secondFilter(rawURLSearchResult, steamURLException))
    .then(gamesInIGDB => returnMeta(gamesInIGDB, igdbIDSearch))
    // 최종 메타데이터 목록
    .then(igdbResult => console.log(igdbResult))
    .catch(err => console.log(err));
});

app.listen(port, () => console.log(`server is running at port${port}`));