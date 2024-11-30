const express = require('express');
const app = express();
const port = 3000;

let cors = require("cors");
app.use(cors());

const fs = require('fs');
const path = require('path');


// Middleware para parsear JSON
app.use(express.json());



function VerificaArquivo(path, arquivo){
    const arquivos = fs.readdirSync(path);
    return arquivos.includes(arquivo);
}

// Rota para receber dados via POST
app.post('/receber-dados', async (req, res) => {
    // Recebe os dados enviados
    const data = req.body;
    console.log('Dados recebidos:', data);
    res.status(200).send('Dados recebidos com sucesso');

    // Verifica se o arquivo existe
    const nomeArquivo = data.nome + '_' + data.turma + '.pdf';
    const diretorio = 'Assets/Turmas/' + data.turma + '/';

    console.log('Diretório:', diretorio);
    console.log('Nome do arquivo:', nomeArquivo);

    if (VerificaArquivo(diretorio, nomeArquivo)){
        // msg = '55' + data.telefone + '@c.us'
        msg = '553398605771@c.us'
        console.log('Enviando arquivo para:', msg);
    } else{
        console.log('Arquivo não encontrado');
    }
});




// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor escutando em http://localhost:${port}`);
});

