const express = require('express');
const fs = require('fs');
const path = require('path');
const { Client, MessageMedia } = require('whatsapp-web.js');
const app = express();
const port = 3000;

let cors = require("cors");
app.use(cors());

// Configuração do multer para upload de arquivos
const upload = multer({ dest: 'uploads/' });

app.use(express.json());

const client = new Client();
client.initialize();

// Rota para receber dados via POST
app.post('/receber-dados', upload.single('arquivo'), async (req, res) => {
    const data = req.body;
    const file = req.file;

    console.log('Dados recebidos:', data);
    console.log('Arquivo recebido:', file);

    if (file) {
        const filePath = path.join(__dirname, file.path);
        const fileContent = fs.readFileSync(filePath);
        const base64File = fileContent.toString('base64');

        // Aqui você pode manipular o arquivo PDF conforme necessário

        // Exemplo de envio do arquivo PDF via WhatsApp
        const msg = '553398605771@c.us'; // Substitua pelo número de telefone correto
        const media = new MessageMedia('application/pdf', base64File, file.originalname);
        await client.sendMessage(msg, media);

        // Remover o arquivo após o processamento
        fs.unlinkSync(filePath);
    }

    res.status(200).send('Dados e arquivo recebidos com sucesso');
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor escutando em http://localhost:${port}`);
});
