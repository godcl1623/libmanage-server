const mysql = require('mysql');
require('dotenv').config()

const dbOptions = {
  host: 'localhost',
  user: process.env.DBUSER,
  password: process.env.SPTWRD,
  database: process.env.DB_USERINFO,
  multipleStatements: true,
  dateStrings: true
};

const libDBOptions = {
  host: 'localhost',
  user: process.env.DBUSER,
  password: process.env.SPTWRD,
  database: process.env.DB_USERLIB,
  multipleStatements: true,
  dateStrings: true
};

const db = mysql.createConnection(dbOptions);
const libDB = mysql.createConnection(libDBOptions);

module.exports = { db, dbOptions, libDB };
