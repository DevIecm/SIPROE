const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const verifyToken = require("../ConfigServices/Midleware");
const { connectToDatabase, sql } = require('../ConfigServices/DatabaseConfiguration')
require('dotenv').config();

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
      .query('SELECT * FROM unidad_territorial ut WHERE distrito = @idDistrito;');

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

module.exports = router;