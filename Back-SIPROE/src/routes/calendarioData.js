const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const verifyToken = require("../ConfigServices/Midleware");
const { connectToDatabase, sql } = require('../ConfigServices/DatabaseConfiguration')
require('dotenv').config();

router.get("/getCalendario", verifyToken, async (req, res) => {

  try {
    const { claveUt } = req.query;
    const claveIUt = claveUt;

    if (!claveIUt) {
      return res.status(400).json({ message: "Datos requeridos" });
    }

    const pool = await connectToDatabase();
    const result = await pool.request()
      .input('claveUt', sql.Int, claveIUt)
      .query(`
        SELECT 
          c.id,
          c.dt,
          c.ut,
          c.distrito,
          c.fecha,
          c.hora,
          dt.dt AS dt,
          ut.ut AS ut
        FROM calendario c
          JOIN demarcacion_territorial dt ON dt.id = c.dt
          JOIN unidad_territorial ut ON ut.clave_ut = c.ut
        WHERE c.distrito = @claveUt
        ORDER BY c.hora ASC;
      `)

    if (result.recordset.length > 0) {
      return res.status(200).json({
        registrosCalendario: result.recordset
      });
    } else {
      return res.status(404).json({ message: "No se encontraron datos en la tabla de calendario", code: 100 });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error de servidor", error: error.message });
  }
});

router.post("/guardaCalendario", verifyToken, async (req, res) => {
  try{
    const {
      dt,
      ut,
      distrito,
      fecha,
      hora
    } = req.body;

    if(!dt || !ut || !distrito || !fecha || !hora) {
      return res.status(400).json({ message: "Datos requeridos"})
    }

    const pool = await connectToDatabase();
    const result = await pool.request()
        .input('dt', sql.Int, dt)
        .input('ut', sql.VarChar, ut)
        .input('distrito', sql.Int, distrito)
        .input('fecha', sql.Date, fecha)
        .input('hora', sql.VarChar, hora)
        .query('INSERT INTO ' +
                'siproe_aleatorio2025.dbo.calendario ' +
                '(dt, ut, distrito, fecha, hora) ' +
                'VALUES(@dt, @ut, @distrito, @fecha, @hora);')
        
     return res.status(200).json({ message: "Registro guardado correctamente", code: 200 });

    } catch(error) {
        console.error(error);
        return res.status(500).json({ message: "Error de servidor" , error});
    }
});

router.delete("/delRegistros", verifyToken, async (req, res) => {
  try {
    const { idUt } = req.query;

    if(!idUt) {
      return res.status(400).json({ message: "Datos requeridos"})
    }

    const pool = await connectToDatabase();
    const result = await pool.request()
        .input('idUt', sql.VarChar, idUt)
        .query('DELETE FROM calendario ' +
                'where ut = @idUt')

    return res.status(200).json({ message: "Registro eliminado correctamente", code: 200 });

    } catch(error) {
      console.error(error);
      return res.status(500).json({ message: "Error de servidor" , error});
    }
});

router.patch("/actualizaRegistros", verifyToken, async (req, res) => {
  try {

    const { fecha, hora, ut, distrito } = req.body;

    if(!fecha || !hora || !ut || !distrito){
      return res.status(400).json({ message: "Datos requeridos"});
    }

    const pool = await connectToDatabase();
    const result = await pool.request()
      .input('fecha', sql.VarChar, fecha)
      .input('hora', sql.VarChar, hora)
      .input('ut', sql.VarChar, ut)
      .input('distrito', sql.Int, distrito)
      .query(`UPDATE calendario set fecha = @fecha , hora = @hora where ut = @ut and distrito = @distrito;`)

      return res.status(200).json({ message: "Registro actualizado correctamente", code: 200 });

  } catch(error) {
    console.error(error);
    return res.status(500).json({ message: "Error de servidor", error});
  }
});

module.exports = router;