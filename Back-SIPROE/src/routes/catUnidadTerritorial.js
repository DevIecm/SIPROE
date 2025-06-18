import { connectToDatabase, sql } from '../ConfigServices/DatabaseConfiguration.js'
import Midleware from '../ConfigServices/Midleware.js';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.get("/catUnidad", Midleware.verifyToken, async (req, res) => {

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
    console.error(error);
    return res.status(500).json({ message: "Error de servidor", error: error.message });
  }
});

router.get("/catUnidadFilter", Midleware.verifyToken, async (req, res) => {

  try {
    const { idDistrito } = req.query;
    const distritoId = parseInt(idDistrito);

    if (!idDistrito) {
      return res.status(400).json({ message: "Datos requeridos" });
    }

    const pool = await connectToDatabase();
    const result = await pool.request()
      .input('idDistrito', sql.Int, distritoId)
      .query(`SELECT DISTINCT
                ut.id, 
                ut.clave_ut, 
                ut.ut, 
                ut.distrito, 
                ut.demarcacion_territorial, 
                dt.dt AS dt, 
                dt.id AS idDt
              FROM unidad_territorial ut
                JOIN demarcacion_territorial dt ON ut.demarcacion_territorial = dt.id
                JOIN proyectos p ON LOWER(ut.clave_ut) = LOWER(p.ut)
                JOIN sorteo s ON p.sorteo = s.id
              WHERE ut.distrito = @idDistrito;`)
      
    if (result.recordset.length > 0) {
      return res.status(200).json({
        catUnidad: result.recordset
      });
    } else {
      return res.status(404).json({ message: "No se encontraron unidades para ese distrito" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error de servidor", error: error.message });
  }
});

router.get("/catunidadFilterSorteo", Midleware.verifyToken, async (req, res) => {

  try {
    const { idDistrito } = req.query;
    const distritoId = parseInt(idDistrito);

    if (!idDistrito) {
      return res.status(400).json({ message: "Datos requeridos" });
    }

    const pool = await connectToDatabase();
    const result = await pool.request()
      .input('idDistrito', sql.Int, distritoId)
      .query(`SELECT DISTINCT 
                p.UT,
                ut.id AS id_ut,
                  ut.clave_ut,
                  ut.ut,
                  p.distrito 
              FROM proyectos p
                JOIN unidad_territorial ut on ut.clave_ut = p.ut
              WHERE p.UT IN (
                SELECT 
                  p2.UT
                FROM proyectos p2
                WHERE p.distrito = @idDistrito and p2.sorteo IS NOT NULL)
              AND (p.sorteo IS NULL OR p.numero_aleatorio IS NULL);`)
      
    if (result.recordset.length > 0) {
      return res.status(200).json({
        catUnidad: result.recordset
      });
    } else {
      return res.status(404).json({ message: "No se encontraron unidades para ese distrito", code: 125 });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error de servidor", error: error.message });
  }
});

export default router;