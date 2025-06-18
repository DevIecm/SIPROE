import { connectToDatabase, sql } from '../ConfigServices/DatabaseConfiguration.js'
import Midleware from '../ConfigServices/Midleware.js';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.get('/exportar', Midleware.verificarTokenGet, async (req, res) => {
  try {
    const pool = await connectToDatabase();
    const result = await pool.request().query('SELECT * FROM proyectos');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al consultar la tabla:', err);
    res.status(500).json({ error: 'Error al consultar la tabla' });
  }
});

export default router;