import sql from "mssql";
import { pool } from "../ConfigServices/DatabaseConfiguration.js";

export const findUser = async (username, password) => {

    const connection = await pool;

    const result = await connection.request()
        .input("username", sql.VarChar, username)
        .input("password", sql.VarChar, password)
        .query(`
            SELECT
                cs.id,
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
            WHERE cs.usuario = @username AND cs.password = @password
        `);

    return result.recordset;
};