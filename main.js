// Importação do express e configurações básicas para ligar o servidor
const express = require('express');
const multer = require('multer');
let cors = require("cors");
const qrcode = require('qrcode-terminal');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Módulos para manipulação dos arquivos e pastas
const fs = require('fs');
const path = require('path');

// Modulos relacionados ao whatsapp-web.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const { MessageMedia } = require('whatsapp-web.js');
const client = new Client({
    authStrategy: new LocalAuth()
});


// **Funções
// Função para verificar se o diretório existe e, caso não exista, criar ele e as subpastas
const verificaDiretorio = (diretorio) => {
    if (!fs.existsSync(diretorio)) {
      fs.mkdirSync(diretorio, { recursive: true });
    }
  };
// Função para configurar os dados para o multer salvar os arquivos.
// path(upload/ano/trimestre/nomeDaTurma)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const ano = new Date().getFullYear().toString();
        const trimestre = Math.floor((new Date().getMonth() + 3) / 3).toString();

        let folderName = req.body.folderName.replace(/\.pdf$/, ""); // Nome da subpasta vindo do corpo da requisição

        console.log(folderName);
        
        const uploadPath = path.join(__dirname, 'uploads', ano, trimestre + 'º trimestre', folderName); // Caminho para salvar o arquivo
    
        verificaDiretorio(uploadPath); // Verifica e cria a pasta
    
        cb(null, uploadPath); // Define onde o arquivo será salvo
      },
      filename: (req, file, cb) => {
        cb(null, file.originalname); // Define o nome do arquivo
      },
    });
    
const upload = multer({ storage });

// Função para achar o diretório
// A função verifica se cada etapa do path é uma diretório existente, gerando uma lista do path fornecido
function lerPastas(diretorio) {
    try {
        const subpastas = fs.readdirSync(diretorio, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
        return subpastas;
    } catch (err) {
        console.error('Erro ao ler diretório:', err);
        return [];
    }
}

// Função para achar o arquivo
// A função verifica se cada etapa do path é um arquivo existente, gerando uma lista do path fornecido
function lerArquivos(diretorio) {
    try {
        const arquivos = fs.readdirSync(diretorio, { withFileTypes: true })
            .filter(dirent => dirent.isFile())
            .map(dirent => dirent.name);
        return arquivos;
    } catch (err) {
        console.error('Erro ao ler arquivos:', err);
        return [];
    }
}

// **ROTAS
// ROTAS PARA UPLOAD DOS ARQUIVOS

// Salva um arquivo na pasta "uploads" com a estrutura "ano/trimestre/nomeDaTurma"
app.post('/upload', upload.single('file'), (req, res) => {
    
    const ano = new Date().getFullYear();
    const trimestre = Math.floor((new Date().getMonth() + 3) / 3).toString();

    res.json({ message: 'Upload realizado com sucesso', filePath: `/uploads/${ano}/${trimestre}º trimestre/${req.file.filename}`});
});

// Servindo a pasta "uploads" de forma estática para acessar os arquivos enviados
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rota para enviar os dados para o número de telefone
app.post('/receber-dados', async (req, res) => {
    const data = req.body;
    console.log('Dados recebidos:', data);

    const ano = new Date().getFullYear();
    const trimestre = Math.floor((new Date().getMonth() + 3) / 3).toString();

    const arquivo = path.join(__dirname, 'uploads', ano, trimestre + 'º trimestre', data.turma, data.nome + '.pdf');

    if (fs.existsSync(arquivo)) {
        // Monta a estrutura do número de telefone.
        // cria um objeto de media para enviar o arquivo.
        // chama a função de envio de mensagem.
        const telefone = '55' + data.telefone + '@c.us';
        const media = MessageMedia.fromFilePath(arquivo);
        await client.sendMessage(telefone, media);
        res.status(200).send('Arquivo enviado com sucesso');
    } else {
        console.log('Nenhum arquivo recebido');
        res.status(400).send('Nenhum arquivo recebido');
    }
});

// Rota para enviar dados para o formulário
// Dados para o preenchimento da turma
app.get('/carrega-turmas', async (req, res) => {
    const ano = new Date().getFullYear();
    const trimestre = Math.floor((new Date().getMonth() + 3) / 3).toString();

    const diretorio = path.join(__dirname, 'uploads', ano, trimestre + 'º trimestre');
    const subpastas = lerPastas(diretorio);
    const turmas = subpastas.map(turma => ({ value: turma, label: turma }));
    res.json(turmas);
    console.log(turmas); 
});
// Dados para o preenchimento dos nomes dos alunos
app.get('/carrega-nomes', async (req, res) => {
    const ano = new Date().getFullYear();
    const trimestre = Math.floor((new Date().getMonth() + 3) / 3).toString();

    const turma = req.query.turma;
    const diretorio = path.join(__dirname, 'uploads', ano, trimestre + 'º trimestre', turma);
    const arquivos = lerArquivos(diretorio);
    const nomes = arquivos.map(arquivo => arquivo.replace('.pdf', '')); 
    res.json(nomes);
    console.log(nomes);
});

// Starts do servidor
app.listen(port, () => {
    console.log(`Servidor escutando em http://localhost:${port}`);
});

client.once('ready', () => {
    console.log('Client is ready!');
});

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
    console.log('QR RECEIVED', qr);
});

client.on('message_create', message => {
	console.log(message.body);
});
client.initialize();