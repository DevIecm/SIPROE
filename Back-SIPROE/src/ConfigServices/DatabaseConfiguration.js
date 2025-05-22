import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

['DB_USER', 'DB_PASSWORD', 'DB_SERVER', 'DB_DATABASE', 'DB_PORT'].forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`Variable no encontrada: ${key}`);
    }
});

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT),
    options: {
        encrypt: process.env.NODE_ENV === 'production',
        trustServerCertificate: process.env.NODE_ENV !== 'production',
        enableArithAbort: true
    }
};

let pool;

export async function connectToDatabase() {
    if (pool) return pool;

    try {
        pool = await sql.connect(config);
        return pool;
    } catch (err) {
        console.error("Error de conexión a base de datos:", err);
        throw err;
    }
}

export { sql };
