import { connectToDatabase, sql } from '../ConfigServices/DatabaseConfiguration.js'
import Midleware from '../ConfigServices/Midleware.js';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.get("/catOrgano", Midleware.verifyToken, async (req, res) => {

    try {
        const { idDistrito } = req.query;
        const distritoId = parseInt(idDistrito);

        if (!idDistrito) {
            return res.status(400).json({ message: "Datos requeridos" });
        }

        const pool = await connectToDatabase();
        const result = await pool.request()
            .query(`SELECT * FROM organo_jurisdiccional ut `);

        if (result.recordset.length > 0) {
        return res.status(200).json({
            catOrgano: result.recordset
        });
        } else {
            return res.status(404).json({ message: "No se encontraron unidades para ese distrito" });
        }
    } catch (err) { 
        console.error(err);
        return res.status(500).json({ message: "Error de servidor", error: error.message });
    }
})

export default router;