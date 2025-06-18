import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secretKey = process.env.JWT_KEY;

function verifyToken(req, res, next) {
    const header = req.header("Authorization");

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token no proporcionado o malformado" });
    }

    const token = header.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token no proporcionado" });
    }

    try {
        const payload = jwt.verify(token, secretKey);
        req.username = payload.username;
        next();
    } catch (error) {
        console.error("Token no válido:", error.message);
        return res.status(403).json({ message: "Token no válido o expirado", code: 160 });
    }
}

function verificarTokenGet(req, res, next) {
  const tokenCliente = req.header("x-api-key");
  const token = process.env.API_KEY;
  console.log("Token del cliente:", token);
  console.log("Token recibido:", tokenCliente);
  
  if(tokenCliente == process.env.API_KEY) {
    console.log("Token válido");
  }

  if (!tokenCliente || tokenCliente !== process.env.API_KEY) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  next();
}

export default {verificarTokenGet, verifyToken};
