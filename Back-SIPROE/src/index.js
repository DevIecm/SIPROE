import cors from 'cors';
import express from 'express';

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

import userRoutes from './routes/users.js';
import unidadRoutes from './routes/catUnidadTerritorial.js';
import calendarioRoutes from './routes/calendarioData.js';
import sorteoRoutes from './routes/sorteoData.js';
import catOrgano from './routes/catOrgano.js';
import asignacionRoutes from './routes/aisgnacionData.js';
import catTipoSorteo from './routes/catTipoSorteo.js';
import resultadosRoutes from './routes/resultadosData.js';
import motivoRoutes from './routes/catMotivo.js';
import reportesRoutes from './routes/reportesData.js';
import reportData from './routes/reportdata.js';
import monitorData from './routes/monitorData.js';

app.use('/api/users', userRoutes);
app.use('/api/catUnidadTerritorial', unidadRoutes);
app.use('/api/calendario', calendarioRoutes);
app.use('/api/sorteo', sorteoRoutes);
app.use('/api/catOrganoJ', catOrgano);
app.use('/api/asignacion', asignacionRoutes);
app.use('/api/catTipoSorteo', catTipoSorteo);
app.use('/api/resultados', resultadosRoutes);
app.use('/api/catMotivo', motivoRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/reportdata', reportData);
app.use('/api/monitor', monitorData);

app.listen(port, () => {
    console.log(`El servicio esta corriendo en ${port}`);
})