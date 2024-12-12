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

// Start your client
client.initialize();

// export client, ;