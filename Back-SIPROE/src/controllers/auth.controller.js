import { loginService } from "../services/auth.service.js";

export const login = async (req, res) => {

    try {

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Datos requeridos"
            });
        }

        const result = await loginService(username, password);

        return res.status(200).json(result);

    } catch (error) {

        return res.status(401).json({
            message: error.message,
            code: error.code
        });

    }

};