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
client.on('message_create', message => {
	if (message.body.toLowerCase() === 'boletim') {
        text = "Informe seu telefone e nome do aluno"
		// send back "pong" to the chat the message was sent in
		client.sendMessage(message.from, text);
	}
});

// Função pra retorno de imagem
client.on('message', async (msg) => {
    if (msg.body.toLowerCase() === 'pdf') {
        const media = MessageMedia.fromFilePath('image/WEB CSS degradê_1.png');
        await client.sendMessage(msg.from, media);
    }
});

