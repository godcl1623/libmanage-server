// const axios = require('axios');
// const { Issuer } = require('openid-client');
// const { cyber, blade } = require('../custom_modules/security/fes');

// const getOwnedGames = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?include_appinfo=1&include_played_free_games=1&key=${cyber}&steamid=${blade}&format=json`;
// const getPlayerSummaries = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${cyber}&steamids=${blade}&format=json`;

// // axios.get(getPlayerSummaries)
// //   .then(res => console.log(res.data.response.players));
// Issuer.discover('http://steamcommunity.com/openid')
//   .then(res => console.log(res))

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
const port = 3010;
const test = 'message sent from api server';

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded());
app.use(helmet(), compression());
app.use(
  csp({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"]
    }
  })
);
db.connect();

passport.use(new SteamStrategy({
    returnURL: 'http://localhost:3010/auth/steam/return',
    realm: 'http://localhost:3010/',
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
    console.log(req.user)
    // res.redirect('/');
    // res.redirect('/close');
    res.redirect('/test')
  }
)

app.get('/login', (req, res) => {
  res.send('failed');
})

app.get('/close', (req, res) => {
  res.send('<script>window.close();</script>');
})

// app.get('/logout', (req, res) => {
//   req.logout();
//   res.redirect('/');
// })

// app.get('/', (req, res) => {
//   // res.send('api server');
//   if (req.user) {
//     res.send('Stored in session when logged : <br><br> ' + 
//     JSON.stringify(req.user) + '<br><br>' +
//     '<a href="/logout">Logout</a>');
//   } else {
//     res.send('Not connected : <a href="/auth/steam"><img src="https://steamcommunity-a.akamaihd.net/public/images/signinthroughsteam/sits_small.png"></a>');
//   }
// });

app.get('/test', (req, res) => {
  // res.redirect('/close');
  res.redirect('http://localhost:3000/main');
});

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
  const { cid, token } = req.body;
  const address = `https://api.igdb.com/v4/games?limit=5&search=assassin's_creed&fields=id,name`;
  axios.post(address, {}, {
    headers: {
      'Client-ID': cid,
      Authorization: `Bearer ${token}`
    }
  }).then(result => console.log(result.data))
});

app.listen(port, () => console.log(`server is running at port${port}`));