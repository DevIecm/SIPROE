import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { encryptSHA256 } from "../utils/crypto.js"
import { findUser } from "../repository/user.repository.js";

dotenv.config();

const secretKey = process.env.JWT_KEY;

export const loginService = async (username, password) => {

    const encryptedPass = encryptSHA256(password);

    const result = await findUser(username, encryptedPass);

    if (result.length === 0) {
        throw { message: "Fallo autenticación", code: 101 };
    }

    const user = result[0];

    if (user.estado_usuario !== 1) {
        throw { message: "Fallo autenticación", code: 401 };
    }

    const token = jwt.sign(
        { username },
        secretKey,
        { expiresIn: "5h" }
    );

    return {
        token,
        userData: result
    };
};