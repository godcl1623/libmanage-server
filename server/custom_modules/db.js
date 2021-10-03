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

const libDBOptions = {
  host: 'localhost',
  user: 'root',
  password: pwd,
  database: 'libmanage_user_steam',
  multipleStatements: true,
  dateStrings: true
}

const db = mysql.createConnection(dbOptions);
const libDB = mysql.createConnection(libDBOptions);
// db.connect();

module.exports = { db, dbOptions, libDB };
