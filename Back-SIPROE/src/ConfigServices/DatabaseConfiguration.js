const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    pass: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
}