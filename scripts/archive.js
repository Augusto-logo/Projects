// Módulos para manipulação dos arquivos e pastas
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configuração do Multer para salvar arquivos no diretório "uploads"

function x (req, file, cb) {
    cb(null, 'uploads'); // Diretório onde os arquivos serão salvos
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads'); // Diretório onde os arquivos serão salvos
    },
    filename: (req, file, cb) => {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    //   cb(null, `${uniqueSuffix}-${file.originalname}`);
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

export {upload};