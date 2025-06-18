import { connectToDatabase, sql } from '../ConfigServices/DatabaseConfiguration.js'
import Midleware from '../ConfigServices/Midleware.js';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.get("/catTipoSorteo", Midleware.verifyToken, async (req, res) => {

  try {

    const { ut } = req.query;

    if( !ut ){
        return res.status(400).json({ message: "Datos requeridos"})
    }
    
    const pool = await connectToDatabase();
    const result = await pool.request()
        .input('ut', sql.VarChar, ut)
        .query(`SELECT DISTINCT ts.descripcion, s.tipo FROM tipo_sorteo ts 
                    JOIN sorteo s ON ts.id = s.tipo
                    JOIN proyectos p ON s.id = p.sorteo
                WHERE p.ut = @ut;`);

    if (result.recordset.length > 0) {
      return res.status(200).json({
        code: 200,
        catTipoSorteo: result.recordset
      });
    } else {
      return res.status(404).json({ 
        code: 100,
        message: "No se encontraron datos de sorteo" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error de servidor", error: error.message });
  }
});

export default router;