import crypto from 'crypto';
import { connectToDatabase, sql } from '../ConfigServices/DatabaseConfiguration.js'
import verifyToken from '../ConfigServices/Midleware.js';
import jwt from 'jsonwebtoken';
import express from 'express';
import dotenv from 'dotenv';

const router = express.Router();
const secretKey = process.env.JWT_KEY;
dotenv.config();

function encryptSHA256(text) {
    const hash = crypto.createHash('sha256');
    hash.update(text);
    return hash.digest('hex');
}

router.post("/login", async (req, res) => {
    try{

        const { username, password } = req.body;

        if(!username || !password) {
            return res.status(400).json({ message: "Datos requeridos"})
        }

        const ecryptedPass = encryptSHA256(password);

        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .input('password', sql.VarChar, ecryptedPass)
            .query(`SELECT
                        cs.id,
                        cs.password,
                        cs.usuario,
                        cs.tipo_usuario, 
                        tu.tipo_usuario AS tipo,
                        es.estado AS estado,
                        cs.distrito AS distrital,
                        cs.estado_usuario,
                        cd.distrito AS footer
                    FROM usuarios cs
                        JOIN tipo_usuario tu ON cs.tipo_usuario = tu.id 
                        JOIN estado_usuario es ON cs.estado_usuario = es.id
                        JOIN cat_distrito cd ON cs.distrito = cd.id
                    WHERE cs.usuario = @username AND cs.password = @password`)

        if (result.recordset.length > 0) {
            if(result.recordset[0].estado_usuario === 1){
                const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });
                return res.status(200).json({ 
                    token, 
                    userData: result.recordset 
                });

            } else {
            
            return res.status(401).json({ message: "Fallo autenticación", code: 401 });
            
            }

        } else {
            return res.status(401).json({ message: "Fallo autenticación", code: 101 });
        }

    } catch(error) {
        return res.status(500).json({ message: "Error de servidor" , error});
    }
});

router.get("/protected", verifyToken, (req, res) => {
    return res.status(200).json({ message: "You have access" });
});

export default router;