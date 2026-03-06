// import { connectToDatabase, sql } from '../ConfigServices/DatabaseConfiguration.js'
// import Midleware from '../ConfigServices/Midleware.js';
// import express from 'express';
// import dotenv from 'dotenv';
// dotenv.config();

// const router = express.Router();

// router.get('/exportar', Midleware.verificarTokenGet, async (req, res) => {
//   try {
//     const pool = await connectToDatabase();
//     const result = await pool.request().query('SELECT * FROM proyectos');
//     res.json(result.recordset);
//   } catch (err) {
//     console.error('Error al consultar la tabla:', err);
//     res.status(500).json({ error: 'Error al consultar la tabla' });
//   }
// });

// router.get('/sei', Midleware.verificarTokenGet, async (req, res) => {
//   try {
//     const { ut } = req.query;

//     if (!ut) {
//       return res.status(400).json({ error: 'Falta la UT' });
//     }

//     const pool = await connectToDatabase();
//     const result = await pool.request()
//       .input('ut', ut) 
//       .query(`
//         SELECT
//           p.id,
//           ut.ut AS nombre_ut,
//           p.numero_aleatorio,
//           p.folio,
//           p.nombre,
//           p.descripcion,
//           CASE p.tipo_ubicacion
//             WHEN 1 THEN 'Toda la unidad territorial'
//             WHEN 2 THEN 'Ubicación específica dentro de la UT'
//             ELSE ''
//           END AS lugar_ejecucion,
//         CONCAT(p.calles,' ',p.num_ext ) AS lugar_ejecucion2,
//          p.referencias,
//          p.dictamen,
//          p.anio
//       FROM 
//         proyectos p
//       INNER JOIN unidad_territorial ut ON p.ut = ut.clave_ut
//         WHERE ut.clave_ut = @ut 
//       `);

//     res.json(result.recordset);
//   } catch (err) {
//     console.error('Error al consultar los proyectos activos:', err);
//     res.status(500).json({ error: 'Error al consultar los proyectos activos' });
//   }
// });

// export default router;