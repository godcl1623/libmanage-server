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
const { db, dbOptions } = require('../custom_modules/db');
const { cyber, blade } = require('../custom_modules/security/fes');

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
db.connect();

passport.use(new SteamStrategy({
    returnURL: 'http://localhost:3010/auth/steam/return',
    realm: 'http://localhost:3010/',
    apiKey: cyber
  },
  (identifier, profile, done) => {
    process.nextTick(() => {
      profile.identifier = identifier;
      console.log(identifier, profile, done(null, profile));
      return done(null, profile);
    });
  }
));

passport.serializeUser((user, done) => {
  console.log(done(null, user));
  done(null, user);
});

passport.deserializeUser((user, done) => {
  console.log(done(null, user));
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
    failureRedirect: '/login'
  }),
  (req, res) => {
});

app.get('/auth/steam/return',
  passport.authenticate('steam', {
    failureRedirect: '/login'
  }),
  (req, res) => {
    res.redirect('/');
  }
)

app.get('/login', (req, res) => {
  res.send('failed');
})

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
})

app.get('/', (req, res) => {
  // res.send('api server');
  if (req.user) {
    res.send('Stored in session when logged : <br><br> ' + 
    JSON.stringify(req.user) + '<br><br>' +
    '<a href="/logout">Logout</a>');
  } else {
    res.send('Not connected : <a href="/auth/steam"><img src="https://steamcommunity-a.akamaihd.net/public/images/signinthroughsteam/sits_small.png"></a>');
  }
});

app.get('/test', (req, res) => {
  res.send(test)
});


app.listen(port, () => console.log(`server is running at port${port}`));