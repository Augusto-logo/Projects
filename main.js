// Express para ligar o servidor web
const express = require('express');
const multer = require('multer');
let cors = require("cors");
const { PDFDocument } = require('pdf-lib');

// Módulos para manipulação dos arquivos e pastas
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Função para verificar e criar pasta se não existir
const verificaDiretorio = (diretorio) => {
    if (!fs.existsSync(diretorio)) {
      fs.mkdirSync(diretorio, { recursive: true }); // Cria a pasta e subpastas, se necessário
    }
  };

// Configuração do Multer para salvar arquivos no diretório "uploads"
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const ano = new Date().getFullYear().toString();// Ano atual

        const folderName = file.originalname; // Nome da subpasta vindo do corpo da requisição
        const uploadPath = path.join(__dirname, 'uploads', ano,  folderName);
    
        verificaDiretorio(uploadPath); // Verifica e cria a pasta
    
        cb(null, uploadPath); // Define onde o arquivo será salvo
      },
      filename: (req, file, cb) => {
        cb(null, file.originalname); // Define o nome do arquivo
      },
    });
    
const upload = multer({ storage });

const desmembraPDF = async (req, res, next) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
    }

    try {
        const pdfDoc = await PDFDocument.load(fs.readFileSync(file.path));
        // Manipule o PDF aqui (divida, renomeie, etc.)
        // Exemplo: Renomear o arquivo
        const novoNome = `novo_${file.originalname}`;
        const novoCaminho = path.join(path.dirname(file.path), novoNome);

        fs.renameSync(file.path, novoCaminho);

        // Atualize o caminho do arquivo no req.file
        req.file.path = novoCaminho;
        req.file.filename = novoNome;

        next();
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao manipular o arquivo PDF' });
    }
};

// Rota para upload de arquivos
app.post('/upload', desmembraPDF, upload.single('file'), (req, res) => {
    const ano = new Date().getFullYear();
    res.json({ message: 'Upload realizado com sucesso', filePath: `/uploads/${ano}/${req.file.filename}` });
});

// Servindo a pasta "uploads" de forma estática para acessar os arquivos enviados
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rota para receber dados via POST
app.post('/receber-dados', async (req, res) => {
    // Recebe os dados enviados
    const data = req.body;
    const file = req.file;

    console.log('Dados recebidos:', data);
    console.log('Arquivo recebido:', file);

    if (file) {
        console.log('Arquivo recebido com sucesso:', file.originalname);
        res.status(200).send('Dados e arquivo recebidos com sucesso');
    } else {
        console.log('Nenhum arquivo recebido');
        res.status(400).send('Nenhum arquivo recebido');
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor escutando em http://localhost:${port}`);
});