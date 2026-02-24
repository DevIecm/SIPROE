import { connectToDatabase, sql } from '../ConfigServices/DatabaseConfiguration.js'
import Midleware from '../ConfigServices/Midleware.js';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.get("/getCalendario", Midleware.verifyToken, async (req, res) => {

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
          ut.ut AS ut,
          c.anio,
          cd.domicilio AS domicilio,
          cd.nombre_sod AS sod,
          cd.nombre_tod AS tod
        FROM calendario c
          JOIN demarcacion_territorial dt ON dt.id = c.dt
          JOIN unidad_territorial ut ON ut.clave_ut = c.ut
          JOIN cat_distrito cd ON cd.id = c.distrito
        WHERE c.distrito = @claveUt
        ORDER BY c.fecha, c.hora ASC;
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

router.post("/guardaCalendario", Midleware.verifyToken, async (req, res) => {
  try{
    const {
      dt,
      ut,
      distrito,
      fecha,
      hora,
      anio
    } = req.body;

    if(!dt || !ut || !distrito || !fecha || !hora || !anio){
      return res.status(400).json({ message: "Datos requeridos"})
    }

    const pool = await connectToDatabase();
    const result = await pool.request()
        .input('dt', sql.Int, dt)
        .input('ut', sql.VarChar, ut)
        .input('distrito', sql.Int, distrito)
        .input('fecha', sql.Date, fecha)
        .input('hora', sql.VarChar, hora)
        .input('anio', sql.Int, anio)
        .query('INSERT INTO ' +
                'siproe_aleatorio2025.dbo.calendario ' +
                '(dt, ut, distrito, fecha, hora, anio) ' +
                'VALUES(@dt, @ut, @distrito, @fecha, @hora, @anio);')
        
     return res.status(200).json({ message: "Registro guardado correctamente", code: 200 });

    } catch(error) {
        console.error(error);
        return res.status(500).json({ message: "Error de servidor" , error});
    }
});

router.delete("/delRegistros", Midleware.verifyToken, async (req, res) => {
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

router.patch("/actualizaRegistros", Midleware.verifyToken, async (req, res) => {
  try {

    const { fecha, hora, ut, distrito, anio } = req.body;

    if(!fecha || !hora || !ut || !distrito, !anio) {
      return res.status(400).json({ message: "Datos requeridos"});
    }

    const pool = await connectToDatabase();
    const result = await pool.request()
      .input('fecha', sql.VarChar, fecha)
      .input('hora', sql.VarChar, hora)
      .input('ut', sql.VarChar, ut)
      .input('distrito', sql.Int, distrito)
      .input('anio', sql.Int, anio)
      .query(`UPDATE calendario set fecha = @fecha , anio = @anio, hora = @hora where ut = @ut and distrito = @distrito;`)

      return res.status(200).json({ message: "Registro actualizado correctamente", code: 200 });

  } catch(error) {
    console.error(error);
    return res.status(500).json({ message: "Error de servidor", error});
  }
});

export default router;