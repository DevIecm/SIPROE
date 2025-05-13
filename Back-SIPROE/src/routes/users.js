const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const verifyToken = require("../ConfigServices/Midleware");
const { connectToDatabase, sql } = require('../ConfigServices/DatabaseConfiguration')
require('dotenv').config();
const secretKey = process.env.JWT_KEY;
const crypto = require('crypto');

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
            .query('SELECT ' +
                    'cs.id, ' +
                    'cs.password, ' +
                    'cs.usuario, ' +
                    'tu.tipo_usuario AS tipo, ' +
                    'es.estado AS estado, ' +
                    'cs.distrito AS distrital, ' +
                    'cs.estado_usuario ' +
                    'FROM usuarios cs ' +
                    'JOIN tipo_usuario tu ON cs.id = tu.id ' +
                    'JOIN estado_usuario es ON cs.estado_usuario = es.id ' +
                    'JOIN cat_distrito cd ON cs.distrito = cd.id ' +
                    'WHERE cs.usuario = @username AND cs.password = @password;')

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

module.exports = router;