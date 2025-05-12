const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const verifyToken = require("../ConfigServices/Midleware");
const secretKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30";
require('dotenv').config();
const tokens = process.env.JWT_KEY;

router.post("/login", (req, res) => {
    try{
        const username = req.body.username;
        const password = req.body.password;

        if(!username || !password) {
            return res.status(400).json({ message: "Datos requeridos"})
        }

        //aqui hacemos la consulta a la tabla de usuarios para saber que iusuario y contraseña traemos
        if(username === "admin" && password === "admin"){
            const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });
            return res.status(200).json({ token});
        } else {
            return rest.status(401).json({ message: "Fallo autenticación"});
        }

    } catch(error) {
        return res.status(500).json({ message: "Error de servidor"});
    }
});

router.get("/protected", verifyToken, (req, res) => {
    return res.status(200).json({ message: "You have access" });
});

module.exports = router;