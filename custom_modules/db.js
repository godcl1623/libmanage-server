// const mysql = require('mysql');
const mysql = require('mysql2/promise');
require('dotenv').config()

const dbProdOptions = {
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  multipleStatements: true,
  dateStrings: true
}

const prodDB = mysql.createPool(dbProdOptions);

module.exports = { prodDB, dbProdOptions };
