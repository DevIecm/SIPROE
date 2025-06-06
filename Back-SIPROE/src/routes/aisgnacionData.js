import { connectToDatabase, sql } from '../ConfigServices/DatabaseConfiguration.js'
import verifyToken from '../ConfigServices/Midleware.js';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.post("/insertaSorteo", verifyToken, async (req, res) => {
    try{
        const {id_o, fecha_sentencia, motivo, numero_expediente, id_motivo} = req.body;

        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('id_o', sql.Int, id_o)
            .input('fecha_sentencia', sql.Date, fecha_sentencia)
            .input('motivo', sql.VarChar, motivo)
            .input('numero_expediente', sql.VarChar, numero_expediente)
            .input('id_motivo', sql.Int, id_motivo)
            .query(`INSERT INTO sorteo (tipo, estado, fecha, organo_jurisdiccional, fecha_sentencia, motivo, numero_expediente, id_motivo)
              OUTPUT INSERTED.id
              VALUES (2, 1, GETDATE(), @id_o, @fecha_sentencia, @motivo, @numero_expediente, @id_motivo);`);

        const insertedId = result.recordset[0].id;

        return res.status(200).json({
        message: "Registro creado correctamente",
        id: insertedId,
        code: 200,
        });
            
    } catch(err) {
        console.error(err);
        return res.status(500).json({ message: "Error de servidor", err})
    }
});

router.get("/getSorteosFilter", verifyToken, async (req, res) => {
    try {
        const { ut, distrito, tipo } = req.query;
        
        if(!ut || !distrito || !tipo){
            return res.status(400).json({ message: "Datos requeridos"})
        }

        const tipoNum = Number(tipo);
        const pool = await connectToDatabase();

        if(tipoNum === 1) {
            const result = await pool.request()
            .input('ut', sql.VarChar, ut)
            .input('distrito', sql.Int, distrito)
            .input('tipo', sql.Int, tipo)
            .query(`SELECT DISTINCT 
                        p2.anio,
                        p.id,
                        p2.ut as clave,
                        ut.ut as ut,
                        p.fecha as fecha_sorteo,
                        COUNT(*) OVER() AS aprobados,
                        SUM(CASE WHEN p2.sorteo IS NULL OR p2.sorteo = '' THEN 1 ELSE 0 END) OVER() AS sortear,
                        SUM(CASE WHEN p2.sorteo IS NOT NULL AND p2.sorteo <> '' THEN 1 ELSE 0 END) OVER() AS sorteados
                    FROM sorteo p 
                        JOIN proyectos p2 ON p2.sorteo = p.id
                        JOIN unidad_territorial ut ON p2.ut = ut.clave_ut
                    WHERE p2.ut = @ut and p2.distrito = @distrito and p.estado = 1 and p.tipo = @tipo;`)

            if (result.recordset.length > 0) {
                return res.status(200).json({
                    registrosProyectos: result.recordset
                });
            } else {
                return res.status(404).json({ message: "No se encontraron registros", code: 100})
            }

        } else {
            
            const result = await pool.request()
            .input('ut', sql.VarChar, ut)
            .input('distrito', sql.Int, distrito)
            .input('tipo', sql.Int, tipo)
            .query(`SELECT DISTINCT 
                    p2.anio,
                    p.id,
                    p2.ut as clave,
                    ut.ut as ut,
                    p.fecha as fecha_sorteo,
                    COUNT(*) OVER() AS aprobados,
                    SUM(CASE WHEN p2.sorteo IS NULL OR p2.sorteo = '' THEN 1 ELSE 0 END) OVER() AS sortear,
                    SUM(CASE WHEN p2.sorteo IS NOT NULL AND p2.sorteo <> '' THEN 1 ELSE 0 END) OVER() AS sorteados
                from sorteo p 
                    JOIN proyectos p2 ON p2.sorteo = p.id
                    JOIN unidad_territorial ut ON p2.ut = ut.clave_ut
                WHERE p2.ut = @ut and p2.distrito = @distrito and p.estado = 1 and p.tipo = @tipo;`
            )

            if (result.recordset.length > 0) {
                return res.status(200).json({
                    registrosProyectos: result.recordset
                });
            } else {
                return res.status(404).json({ message: "No se encontraron registros", code: 100})
            }
        }

    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ message: "Error de servidor", error: error.message});
    }
});

router.delete("/deleteSorteo", verifyToken, async (req, res) => {
    try{

        const { id } = req.query;

        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`UPDATE 
                sorteo SET estado = 2 WHERE id = @id;`);

        return res.status(200).json({
            message: "Registro eliminado correctamente",
            code: 200,
            id: id
        });
            
    } catch(err) {
        console.error(err);
        return res.status(500).json({ message: "Error de servidor", err})
    }
});

router.delete("/deleteSorteoR", verifyToken, async (req, res) => {
    try{

        const { id, fecha_sentencia_del, organo_jurisdiccional_del, motivo_del, numero_expediente_del } = req.query;

        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('fecha_sentencia_del', sql.Date, fecha_sentencia_del)
            .input('organo_jurisdiccional_del', sql.VarChar, organo_jurisdiccional_del)
            .input('motivo_del', sql.VarChar, motivo_del)
            .input('numero_expediente_del', sql.VarChar, numero_expediente_del)
            .query(`UPDATE 
                sorteo SET fecha_sentencia_del = @fecha_sentencia_del, organo_jurisdiccional_del = @organo_jurisdiccional_del, motivo_del = @motivo_del, numero_expediente_del = @numero_expediente_del, estado = 2, fecha_eliminacion = GETDATE() WHERE id = @id;`);

        return res.status(200).json({
            message: "Registro eliminado correctamente",
            code: 200,
            id: id
        });
            
    } catch(err) {
        console.error(err);
        return res.status(500).json({ message: "Error de servidor", err})
    }
});

router.patch("/actualizaProyecto", verifyToken, async (req, res) => {
    try {

        const { sorteo } = req.body;

        if( !sorteo ){
            return res.status(400).json({ message: "Datos requeridos"})
        }
        
        const pool = await connectToDatabase();
        
        const result = await pool.request()
            .input('sorteo', sql.Int, sorteo)
            .query(`UPDATE 
                proyectos SET numero_aleatorio = null , sorteo = null 
                WHERE sorteo = @sorteo;
            `);
    
        return res.status(200).json({ message: "Registro actualizado correctamente", code: 200 });

    } catch(err) {
        console.error(err);
        return res.status(500).json({ message: "Error de servidor", err})
    }
})

export default router;