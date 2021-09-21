const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const session = require('express-session');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const axios = require('axios');
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
    const getOwnedGames = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?include_appinfo=1&include_played_free_games=1&key=${cyber}&steamid=${uid}&format=json`;
    axios.get(getOwnedGames)
      .then(result => {
        const rawGamesData = result.data.response.games;
        const tempArr = [];
        rawGamesData.forEach(gameDataObj => {
          tempArr.push(gameDataObj.name)
        });
        const sortedTempArr = tempArr.sort((prev, next) => prev < next ? -1 : 1);
        // 정렬된 게임 목록을 변수 gameList로 업데이트
        gameList = sortedTempArr
      })
      .then(() => {
        axios.post(`http://localhost:${port}/api_test`, { execute: 'order66' })
          .then(result => {
            axios.post(`http://localhost:${port}/db_test`, { test: result.data })
            .then(
              // result => console.log(result)
            );
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
  const tempArr = [];
  // gameList.forEach((game, index) => {
  //   setTimeout(() => {
  //     // tempArr.push(game);
  //     // if (tempArr.length === gameList.length) {
  //     //   console.log(tempArr);
  //     // }
  //     console.log(game)
  //   }, index * 10);
  // })
  const tempList = ["Assassin's Creed"]
  // gameList.forEach((game, index) => {
  tempList.forEach((game, index) => {
    setTimeout(() => {
      const address = `https://api.igdb.com/v4/games?limit=99&search=${game}&fields=id,name`;
      axios.post(address, {}, {
        headers: {
          'Client-ID': cid,
          Authorization: `Bearer ${token}`
        }
      })
        .then(result => {
          const rawData = result.data;
          // const test = rawData.find(obj => obj.name === game);
          // console.log(test)
          console.log(rawData);
          // tempArr.push(test);
          // console.lo(result.data)
          // res.send(result.ata);
        })
        if (tempArr.length === gameList.length) {
          console.log(tempArr)
        }
    }, index * 600);
  });
});

app.listen(port, () => console.log(`server is running at port${port}`));