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

    // Carrega os dados do PDF e cria os arquivos de cada aluno no servidor
    const pdfBytes = Buffer.from(data.pdf, 'base64');
    fs.writeFileSync(path.join(diretorio, nomeArquivo), pdfBytes);
    const d = new Date(year);
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


// Start your client
client.initialize();

// export client, ;