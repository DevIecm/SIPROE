import cors from 'cors';
import express from 'express';
import { login } from "../src/controllers/auth.controller.js";
import { monitor } from './controllers/monitor.controller.js';
import catalogoRoutes from './catalogoRoutes/catalogo.routes.js';
import Middleware from "./ConfigServices/Midleware.js";
import reportData from './routes/reportdata.js';
import calendarioRoutes from './routes/calendarioData.js';
import sorteoRoutes from './routes/sorteoData.js';
import asignacionRoutes from './routes/aisgnacionData.js';
import resultadosRoutes from './routes/resultadosData.js';
import reportesRoutes from './routes/reportesData.js';

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

app.use('/api/users', login);
app.use('/api/catalogos', catalogoRoutes)
app.use('/api/calendario', calendarioRoutes);
app.use('/api/sorteo', sorteoRoutes);
app.use('/api/asignacion', asignacionRoutes);
app.use('/api/resultados', resultadosRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/reportdata', reportData);
app.use('/api/monitor', Middleware.verifyToken, monitor);

app.listen(port, () => {
    console.log(`El servicio esta corriendo en ${port}`);
})