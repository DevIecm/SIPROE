const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT),
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
}

async function connectToDatabase() {
    try {
        const pool = await sql.connect(config);
        return pool;
    } catch (err) {
        console.log("error", err);
        throw error;
    }
}

module.exports = { connectToDatabase, sql };