// 1. IMPORTAÇÕES
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); // <-- Importa nossa função de conexão

// 2. CONFIGURAÇÃO INICIAL
dotenv.config({ path: './.env', quiet: true }); // Carrega as variáveis de ambiente

connectDB(); // <-- Executa a conexão com o banco de dados

const app = express(); // Instancia o aplicativo Express

// 3. MIDDLEWARES
app.use(cors());
app.use(express.json());

// 4. ROTAS (Placeholder)
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'API da Barbearia no ar!'
    });
});


// 5. INICIALIZAÇÃO DO SERVIDOR
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}...`);
});

module.exports = app;