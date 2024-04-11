//npm install mysql2
const mysql = require("mysql2");
const bluebird = require("bluebird");
const connect = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.MYSQL_PASSWORD,
  database: "test",
});

module.exports = connect;
