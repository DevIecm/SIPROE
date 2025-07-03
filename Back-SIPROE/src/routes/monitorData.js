import express from 'express';
import Midleware from "../ConfigServices/Midleware";
import { connectToDatabase } from '../ConfigServices/DatabaseConfiguration';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

router.get("/dataMonitor", Midleware.verifyToken, async (req, res) => {
    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .query(`
                SELECT *
                    FROM (SELECT CAST(u.distrito AS VARCHAR(100)) AS distrito, COUNT(DISTINCT p.ut) AS total_ut,
                    (SELECT COUNT(DISTINCT s.clave_ut) FROM sorteo s
                        WHERE s.clave_ut IN (SELECT clave_ut FROM unidad_territorial WHERE distrito = u.distrito)) AS total_ut_sorteadas,
                    CAST(
                    (
                    (
                        SELECT COUNT(DISTINCT s.clave_ut)
                        FROM sorteo s
                        WHERE s.clave_ut IN (
                        SELECT clave_ut
                        FROM unidad_territorial
                        WHERE distrito = u.distrito
                    )
                    ) * 100.0
                    ) / COUNT(DISTINCT p.ut) AS DECIMAL(5,2)
                    ) AS porcentaje_sorteadas
                    FROM proyectos p
                        INNER JOIN unidad_territorial u ON p.ut = u.clave_ut
                        GROUP BY u.distrito

                    UNION ALL

                    SELECT
                        CAST('TOTAL' AS VARCHAR(100)) AS distrito,
                        COUNT(DISTINCT p.ut),
                        COUNT(DISTINCT s.clave_ut),
                        CAST(COUNT(DISTINCT s.clave_ut) * 100.0 / NULLIF(COUNT(DISTINCT p.ut), 0) AS DECIMAL(5,2))
                    FROM proyectos p
                        INNER JOINunidad_territorial u ON p.ut = u.clave_ut
                        LEFT JOIN sorteo s ON s.clave_ut = u.clave_ut
                    ) AS resultado
                    ORDER BY
                    CASE
                        WHEN distrito = 'TOTAL' THEN 1 ELSE 0 END,
                    CASE
                        WHEN distrito = 'TOTAL' THEN NULL ELSE CAST(distrito AS INT) END;`)

        if(result.recordset.length > 0) {
            return res.status(200).json({
                registrosMonitor: result.recordset
            });
        } else {
            return res.status(404).json({ message: "No se encontraron registros", code: 100})
        }
    } catch (error) {
        return res.status(500).json({ message: "Error de servidor", error: error.message});
    }
});

export default router;