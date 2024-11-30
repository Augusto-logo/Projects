
// Express para ligar o servidor web
const express = require('express');
const app = express();
const port = 3000;

let cors = require("cors");
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Módulos para manipulação dos arquivos e pastas
const fs = require('fs');
const path = require('path');

// Modulos relacionados ao whatsapp-web.js
const { Client, LocalAuth } = require('whatsapp-web.js');

// Função para mandar MediaType(PDF, foto, etc)
const { MessageMedia } = require('whatsapp-web.js');

// Cria um objeto para inicializar um QR CODE
const qrcode = require('qrcode-terminal');

// Create a new client instance
const client = new Client({
    authStrategy: new LocalAuth()
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log('Client is ready!');
});

// When the client received QR-Code
client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
    console.log('QR RECEIVED', qr);
});

// Start your client
client.initialize();

// Listening to all incoming messages
client.on('message_create', message => {
	console.log(message.body);
});

//Função para retorno de texto
// client.on('message_create', message => {
// 	if (message.body.toLowerCase() === 'boletim') {
//         text = "Informe seu telefone e nome do aluno!"
// 		// send back "pong" to the chat the message was sent in
// 		client.sendMessage(message.from, text);
// 	}
// });


// Função para retorno de PDF a partir de uma mensagem no WPP
// client.on('message', async (msg) => {
//     if (msg.body === 'pdf') {
//         const media = MessageMedia.fromFilePath('Assets/BoletimSingular.pdf');
//         await client.sendMessage(msg.from, media);
//     }
// });

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

    if (VerificaArquivo(diretorio, nomeArquivo)){
        // msg = '55' + data.telefone + '@c.us'
        msg = '553398605771@c.us'
        const media = MessageMedia.fromFilePath(path.join(diretorio,nomeArquivo));
        await client.sendMessage(msg, media);
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor escutando em http://localhost:${port}`);
});