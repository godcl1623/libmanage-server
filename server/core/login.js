const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const servestatic = require('serve-static');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');

const app = express();
const port = 3002;

app.use(cors());
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded());

app.get('/', (req, res) => {
  res.send('login server');
});

app.post('/test', (req, res) => {
  console.log(req.body);
  // console.log(res);
});

app.listen(port, () => console.log(`server is running at port${port}`));