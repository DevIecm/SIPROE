const jwt = require("jsonwebtoken");
require('dotenv').config();

const secretKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30";

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
