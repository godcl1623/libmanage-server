const mysql = require('mysql');
const pwd = require('./security/pwd');

const dbOptions = {
  host: 'localhost',
  user: 'root',
  password: pwd,
  database: 'libmanage',
  multipleStatements: true,
  dateStrings: true
}

const db = mysql.createConnection(dbOptions);
// db.connect();

module.exports = { db, dbOptions };
