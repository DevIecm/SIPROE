const jwt = require("jsonwebtoken");
require('dotenv').config();
const secretKey = process.env.JWT_KEY;

function verifyToken(req, res, next) {
    const header = req.header("Authorization") || "";
    const token = header.split(" ")[1];

    if(!token) {
        return res.status(401).json({ message: "Token not provied"});
    }

    try{
        const playload = jwt.verify(token, secretKey);
        req.username = playload.username;
        next();
    }catch(error){
        return res.status(403).json({ message: "Token not valid"});
    }
}

module.exports = verifyToken;
