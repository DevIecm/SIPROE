import { connectToDatabase, sql } from '../ConfigServices/DatabaseConfiguration.js'
import verifyToken from '../ConfigServices/Midleware.js';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.get("/catUnidad", verifyToken, async (req, res) => {

  try {
    const { idDistrito } = req.query;
    const distritoId = parseInt(idDistrito);

    if (!idDistrito) {
      return res.status(400).json({ message: "Datos requeridos" });
    }

    const pool = await connectToDatabase();
    const result = await pool.request()
      .input('idDistrito', sql.Int, distritoId)

    .query('SELECT ut.id, ut.clave_ut, ut.ut, ut.distrito, ut.demarcacion_territorial, dt.dt as dt, dt.id as idDt ' +
    'FROM unidad_territorial ut ' + 
      'JOIN demarcacion_territorial dt ON ut.demarcacion_territorial  = dt.id ' +
    'WHERE ut.distrito = @idDistrito;');

    if (result.recordset.length > 0) {
      return res.status(200).json({
        catUnidad: result.recordset
      });
    } else {
      return res.status(404).json({ message: "No se encontraron unidades para ese distrito" });
    }
  } catch (error) {
    console.error(error); // importante para depurar
    return res.status(500).json({ message: "Error de servidor", error: error.message });
  }
});

export default router;