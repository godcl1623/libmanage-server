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

const dbProdOptions = {
  host: process.env.DB_PROD_HOST,
  user: process.env.DB_PROD_USER,
  password: process.env.DB_PROD_PWD,
  database: process.env.DB_PROD_SCHEME,
  multipleStatements: true,
  dateStrings: true
}

const db = mysql.createConnection(dbOptions);
const libDB = mysql.createConnection(libDBOptions);
const prodDB = mysql.createPool(dbProdOptions);

module.exports = { db, dbOptions, libDB, prodDB, dbProdOptions };
