import { connectToDatabase, sql } from '../ConfigServices/DatabaseConfiguration.js'
import verifyToken from '../ConfigServices/Midleware.js';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.post("/insertaSorteo", verifyToken, async (req, res) => {
    try{
        const {id_o, fecha_sentencia, motivo, numero_expediente} = req.body;

        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('id_o', sql.Int, id_o)
            .input('fecha_sentencia', sql.Date, fecha_sentencia)
            .input('motivo', sql.VarChar, motivo)
            .input('numero_expediente', sql.VarChar, numero_expediente)
            .query(`INSERT INTO sorteo (tipo, estado, fecha, organo_jurisdiccional, fecha_sentencia, motivo, numero_expediente)
              OUTPUT INSERTED.id
              VALUES (2, 1, GETDATE(), @id_o, @fecha_sentencia, @motivo, @numero_expediente);`);

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
            .query(`SELECT
                        p.id,
                        p.nombre,
                        p.folio,
                        p.numero_aleatorio,
                        p.dictamen,
                        p.distrito,
                        p.sorteo,
                        p.anio,
                        p.ut,
                        c.organo_jurisdiccional,
                        c.fecha,
                        c.tipo,
                        c.estado,
                        ut.ut as nombreUt,
                        COUNT(*) OVER() AS aprobados,
                        SUM(CASE WHEN p.sorteo IS NULL OR p.sorteo = '' THEN 1 ELSE 0 END) OVER() AS sortear,
                        SUM(CASE WHEN p.sorteo IS NOT NULL AND p.sorteo <> '' THEN 1 ELSE 0 END) OVER() AS sorteados
                    FROM proyectos p 
                        JOIN sorteo c ON p.sorteo = c.id
                        JOIN unidad_territorial ut ON p.ut = ut.clave_ut
                    WHERE p.ut = @ut and p.distrito = @distrito and c.estado = 1 and c.tipo = @tipo;`)

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
            .query(`
                SELECT TOP 1
                    p.id,
                    p.nombre,
                    p.folio,
                    p.numero_aleatorio,
                    p.dictamen,
                    p.distrito,
                    p.sorteo,
                    p.anio,
                    p.ut,
                    c.fecha_sentencia,
                    c.motivo,
                    c.numero_expediente,
                    c.organo_jurisdiccional,
                    c.fecha,
                    c.tipo,
                    c.estado,
                    ut.ut as nombreUt,
                    COUNT(*) OVER() AS aprobados,
                    oj.descripcion as organo_descrpcion,
                    SUM(CASE WHEN p.sorteo IS NULL OR p.sorteo = '' THEN 1 ELSE 0 END) OVER() AS sortear,
                    SUM(CASE WHEN p.sorteo IS NOT NULL AND p.sorteo <> '' THEN 1 ELSE 0 END) OVER() AS sorteados
                FROM proyectos p 
                    JOIN sorteo c ON p.sorteo = c.id
                    JOIN unidad_territorial ut ON p.ut = ut.clave_ut
                    JOIN organo_jurisdiccional oj ON c.organo_jurisdiccional  = oj.id
                WHERE p.ut = @ut and p.distrito = @distrito and c.estado = 1 and c.tipo = 2;`
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
        return res.status(500).json({ message: "Error de servidor", error: error.message0});
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