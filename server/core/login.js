const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const servestatic = require('serve-static');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');

const app = express();
const router = express.Router();
const port = 3002;
const loginInfo = {
  ID: 'test',
  PWD: '0000'
}

app.use(cors());
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded());

app.get('/', (req, res) => {
  res.send('login server');
});

app.post('/test', (req, res) => {
  console.log(req.body);
  res.send('foo');
});

// app.post('/login_process', (req, res) => {
//   if (req.body.ID === loginInfo.ID && req.body.PWD === loginInfo.PWD) {
//     // res.writeHead(200, {
//     //   'Set-Cookie': [`id=${loginInfo.ID}`, `pwd=${loginInfo.PWD}`]
//     // });
//     res.send('login success !');
//     res.redirect('http://localhost:3000/main');
//     // res.end('login success !');
//   } else {
//     res.send('login fail');
//   }
// });

router.route('/login_process').post((req, res) => {
  if (req.body.ID === loginInfo.ID && req.body.PWD === loginInfo.PWD) {
    res.send('login success !');
    res.redirect('/main');
  } else {
    res.send('login fail');
  }
});

app.listen(port, () => console.log(`server is running at port${port}`));