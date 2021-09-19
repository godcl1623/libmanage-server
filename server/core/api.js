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

// app.get('/logout', (req, res) => {
//   req.logout();
//   res.redirect('/');
// })

app.get('/', (req, res) => {
  res.send('api server');
});

app.get('/test', (req, res) => {
  // res.send(test)
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