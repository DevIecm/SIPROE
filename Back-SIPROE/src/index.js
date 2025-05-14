const express = require('express');
const app = express();
const port = 4000;
const cors = require('cors');

//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors());

const userRoutes = require('./routes/users');
const unidadRoutes = require('./routes/catUnidadTerritorial');
const calendarioRoutes = require('./routes/calendarioData');

app.use('/api/users', userRoutes);
app.use('/api/catUnidadTerritorial', unidadRoutes);
app.use('/api/calendario', calendarioRoutes);

app.listen(port, () => {
    console.log(`El servicio esta corriendo en ${port}`);
})