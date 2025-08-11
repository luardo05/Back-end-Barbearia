// File: src/middleware/upload.js
const multer = require('multer');

// Configura o multer para armazenar o arquivo em memória como um buffer
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    // Filtro para aceitar apenas certos tipos de arquivo (ex: imagens)
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image')) {
            cb(null, true);
        } else {
            cb(new Error('Formato de arquivo não suportado! Apenas imagens são permitidas.'), false);
        }
    },
    // Limite de tamanho do arquivo (ex: 5MB)
    limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;