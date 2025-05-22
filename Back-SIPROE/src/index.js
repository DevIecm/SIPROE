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

app.use('/api/users', userRoutes);
app.use('/api/catUnidadTerritorial', unidadRoutes);
app.use('/api/calendario', calendarioRoutes);
app.use('/api/sorteo', sorteoRoutes);

app.listen(port, () => {
    console.log(`El servicio esta corriendo en ${port}`);
})