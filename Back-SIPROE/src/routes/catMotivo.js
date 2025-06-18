import { connectToDatabase, sql } from '../ConfigServices/DatabaseConfiguration.js'
import Midleware from '../ConfigServices/Midleware.js';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.get("/catMotivo", Midleware.verifyToken, async (req, res) => {

  try {
    
    const pool = await connectToDatabase();
    const result = await pool.request()
        .query(`SELECT 
                    cm.id, 
                    cm.motivo 
                FROM cat_motivo cm; ;`);

    if (result.recordset.length > 0) {
      return res.status(200).json({
        catMotivo: result.recordset
      });
    } else {
      return res.status(404).json({ message: "No se encontraron datos de tipo" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error de servidor", error: error.message });
  }
});

export default router;