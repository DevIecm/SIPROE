const jwt = require("jsonwebtoken");
require('dotenv').config();
const secretKey = process.env.JWT_KEY;

function verifyToken(req, res, next) {
    const header = req.header("Authorization");

    if(!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token no proporcionado o malformado" });
    }

    const token = header.split(" ")[1];

    if(!token) {
        return res.status(401).json({ message: "Token not provied"});
    }

    try{

        const playload = jwt.verify(token, secretKey);
        req.username = playload.username;
        next();

    }catch(error){

        console.error("Token no valido", error.message);
        return res.status(403).json({ message: "Token no valido o expirado", code: 160});

    }
}

module.exports = verifyToken;
