import { pool } from "../ConfigServices/DatabaseConfiguration.js";

export const getMonitor = async() => {
    const connection = await pool;

    const result = await connection.request()
        .query(`SELECT * FROM (
                    SELECT
                        CAST(u.distrito AS VARCHAR(100)) AS distrito,
                        COUNT(DISTINCT p.ut) AS total_ut,
                        (
                            SELECT COUNT(DISTINCT s.clave_ut)
                            FROM sorteo s
                            WHERE s.clave_ut IN (
                                SELECT clave_ut
                                FROM unidad_territorial
                                WHERE distrito = u.distrito
                            )
                        ) AS total_ut_sorteadas,
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
                            ) / COUNT(DISTINCT p.ut)
                        AS DECIMAL(5,2)) AS porcentaje_sorteadas
                    FROM proyectos p
                    INNER JOIN unidad_territorial u ON p.ut = u.clave_ut
                    WHERE p.anio IN (2026, 2027)
                    GROUP BY u.distrito

                    UNION ALL

                    SELECT
                        CAST('TOTAL' AS VARCHAR(100)) AS distrito,
                        COUNT(DISTINCT p.ut),
                        COUNT(DISTINCT s.clave_ut),
                        CAST(
                            COUNT(DISTINCT s.clave_ut) * 100.0 
                            / NULLIF(COUNT(DISTINCT p.ut), 0)
                        AS DECIMAL(5,2))
                    FROM proyectos p
                    INNER JOIN unidad_territorial u ON p.ut = u.clave_ut
                    LEFT JOIN sorteo s ON s.clave_ut = u.clave_ut
                    WHERE p.anio IN (2026, 2027) 
                ) AS resultado
                ORDER BY
                    CASE WHEN distrito = 'TOTAL' THEN 1 ELSE 0 END,
                    CASE WHEN distrito = 'TOTAL' THEN NULL ELSE CAST(distrito AS INT) END;`)

        return result.recordset;
}