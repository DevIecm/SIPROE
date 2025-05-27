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

export default router;