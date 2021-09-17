const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { db, dbOptions } = require('../custom_modules/db');
const { cyber, blade } = require('../custom_modules/security/fes');

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

app.get('/', (req, res) => {
  res.send('api server');
});

app.get('/test', (req, res) => {
  res.send(test)
});

app.listen(port, () => console.log(`server is running at port${port}`));