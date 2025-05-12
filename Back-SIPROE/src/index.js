const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');

app.use(express.json());
app.use(cors());

const userRoutes = require('./routes/users');

app.use('/api/users', userRoutes);

app.listen(port, () => {
    console.log(`El servicio esta corriendo en ${port}`);
})