const express = require('express');
const app = express();
const port = 3000;

let cors = require("cors");
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Rota para receber dados via POST
app.post('/receber-dados', (req, res) => {
    const data = req.body;
    console.log('Dados recebidos:', data);
    res.status(200).send('Dados recebidos com sucesso');
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor escutando em http://localhost:${port}`);
});