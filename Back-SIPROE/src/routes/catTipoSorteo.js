import { connectToDatabase, sql } from '../ConfigServices/DatabaseConfiguration.js'
import verifyToken from '../ConfigServices/Midleware.js';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.get("/catTipoSorteo", verifyToken, async (req, res) => {

  try {
    
    const pool = await connectToDatabase();
    const result = await pool.request()
        .query(`SELECT * FROM tipo_sorteo ts`);

    if (result.recordset.length > 0) {
      return res.status(200).json({
        catTipoSorteo: result.recordset
      });
    } else {
      return res.status(404).json({ message: "No se encontraron datos de sorteo" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error de servidor", error: error.message });
  }
});

export default router;