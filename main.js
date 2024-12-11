// Importação do express e configurações básicas para ligar o servidor
const express = require('express');
const multer = require('multer');
let cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Módulos para manipulação dos arquivos e pastas
const fs = require('fs');
const path = require('path');

// **Funções
// Função para verificar se o diretório existe e, caso não exista, criar ele e as subpastas
const verificaDiretorio = (diretorio) => {
    if (!fs.existsSync(diretorio)) {
      fs.mkdirSync(diretorio, { recursive: true }); // Recursive cria a pasta e subpastas, se necessário.
    }
  };
// Função para configurar os dados para o multer salvar os arquivos.
// path(upload/ano/trimestre/nomeDaTurma)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const ano = new Date().getFullYear().toString(); // Ano atual
        const trimestre = Math.floor((new Date().getMonth() + 3) / 3).toString(); // Trimestre atual

        let folderName = req.body.folderName; // Nome da subpasta vindo do corpo da requisição
        folderName = folderName.replace(/\.pdf$/, "");
        console.log(folderName);
        // ***Verificar se é possível apenas botar o replace no const folderName
        
        const uploadPath = path.join(__dirname, 'uploads', ano, trimestre + 'º trimestre', folderName); // Caminho para salvar o arquivo
    
        verificaDiretorio(uploadPath); // Verifica e cria a pasta
    
        cb(null, uploadPath); // Define onde o arquivo será salvo
      },
      filename: (req, file, cb) => {
        cb(null, file.originalname); // Define o nome do arquivo
      },
    });
    
const upload = multer({ storage });

// Não está sendo utilizada(REMOVER)
const processarUpload = (req, res) => {
    const uploadMultiple = upload.array('files');
    uploadMultiple(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
    });
};

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

// Salva um arquivo 
app.post('/upload', upload.single('file'), (req, res) => {
    
    const ano = new Date().getFullYear();
    res.json({ message: 'Upload realizado com sucesso', filePath: `/uploads/${ano}/4 º trimestre/${req.file.filename}` });
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

// Rota para enviar dados do formulário
// Dados para o preenchimento da turma e dos nomes
app.get('/carrega-turmas', async (req, res) => {
    const diretorio = path.join(__dirname, 'uploads', '2024', '4º trimestre');
    const subpastas = lerPastas(diretorio);
    const turmas = subpastas.map(turma => ({ value: turma, label: turma }));
    res.json(turmas);
    console.log(turmas); // Saída: [{ value: 'A1A', label: 'A1A' }, { value: 'I1A', label: 'I1A' }]
});

app.get('/carrega-nomes', async (req, res) => {
    const turma = req.query.turma;
    const diretorio = path.join(__dirname, 'uploads', '2024', '4º trimestre', turma);
    const arquivos = lerArquivos(diretorio);
    const nomes = arquivos.map(arquivo => arquivo.replace('.pdf', '')); // Remove a extensão .pdf
    res.json(nomes);
    console.log(nomes); // Saída: ['P1', 'P2', 'P3'] ou ['P4', 'P5', 'P6']
});

// Start do servidor
app.listen(port, () => {
    console.log(`Servidor escutando em http://localhost:${port}`);
});