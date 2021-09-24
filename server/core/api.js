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
        const tempArr = [];
        rawGamesData.forEach(gameDataObj => {
          tempArr.push(gameDataObj.appid)
        });
        const sortedTempArr = tempArr.sort((prev, next) => prev < next ? -1 : 1);
        // 정렬된 게임 목록을 변수 gameList로 업데이트
        gameList = sortedTempArr
        // console.log(gameList);
      })
      .then(() => {
        axios.post(`http://localhost:${port}/api_test`, { execute: 'order66' })
          .then(result => {
            axios.post(`http://localhost:${port}/db_test`, { test: result.data })
              .then(result => {
                axios.post(`http://localhost:${port}/db_test2`, { test: result.data })
                  .then(result => {
                    axios.post(`http://localhost:${port}/db_test3`, { test: result.data })
                      .then(result => console.log(result));
                  })
              })
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
app.post('/api_test', (req, res) => {
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

app.post('/db_test', (req, res) => {
  // console.log(req.body.gameList);
  const { cid, access_token: token } = req.body.test;
  const client = igdb(cid, token);
  const tempArr = [];
  const arrFail = [];
  const steamURLSearchQuery = async (steamAppId, arr, fail, total) => {
    const response = await client
      .fields(['*'])
      .where(`category = 13 & url = *"/${steamAppId}"`)
      .request('/websites');
    if (response.data[0] === undefined) {
      fail.push(steamAppId);
    } else {
      arr.push(response.data[0].game);
      // 기능 완성 이후 삭제할 것
      console.log(arr.length + fail.length);
    }
    if (arr.length + fail.length === total) {
      return true;
    }
  }
  gameList.forEach((steamAppId, index) => {
    setTimeout(() => {
      steamURLSearchQuery(steamAppId, tempArr, arrFail, gameList.length)
        .then(result => {
          if (result) {
            const resData = {
              cid,
              token,
              tempArr,
              arrFail
            }
            res.send(resData);
          }
        });
    }, index * 300);
  });
});

app.post('/db_test2', (req, res) => {
  const { cid, token, tempArr, arrFail } = req.body.test;
  const client = igdb(cid, token);
  const secArr = [];
  const secFail = [];
  const steamURLException = async (steamAppId, arr, fail) => {
    const response = await client
      .fields(['*'])
      .where(`category = 13 & url = *"/${steamAppId}/"*`)
      .request('/websites');
    if (response.data[0] === undefined && arrFail.includes(steamAppId)) {
      fail.push(steamAppId);
    // eslint-disable-next-line no-else-return
    } else {
      arr.push(response.data[0].game);
      // 기능 구현 이후에 삭제할 것
      console.log(secArr.length + secFail.length);
    }
    if (secArr.length + secFail.length === arrFail.length) {
      return true;
    }
  }
  arrFail.forEach((steamAppId, index) => {
    setTimeout(() => {
      steamURLException(steamAppId, secArr, secFail)
        .then(result => {
          if (result) {
            const resData = {
              cid,
              token,
              resArr: tempArr.concat(secArr).sort((prev, next) => prev < next ? -1 : 1)
            }
            res.send(resData);
          }
        });
    }, index * 300);
  });
});

app.post('/db_test3', (req, res) => {
  const { cid, token, resArr } = req.body.test;
  const client = igdb(cid, token);
  // appid로 검색이 되지 않는 경우 = igdb에 스팀 url이 등록되지 않음 혹은 진짜 없거나
  // 메인 게임이 아님
  const igdbIDSearch = async igdbID => {
    const response = await client
      .fields(['name'])
      // .search('cyberpunk 2077')
      .where(`id = ${igdbID}`)
      .request('/games');
    console.log(response.data);
  }
  resArr.forEach((igdbID, index) => {
    setTimeout(() => {
      igdbIDSearch(igdbID);
    }, index * 300);
  });
});

app.listen(port, () => console.log(`server is running at port${port}`));