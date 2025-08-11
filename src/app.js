// 1. IMPORTAÇÕES
const express = require('express'); //para o servidor
const dotenv = require('dotenv'); // para usar as variáveis de ambiente
const cors = require('cors'); // para evitar erro de cors
const helmet = require('helmet'); // <-- Importa o Helmet
const morgan = require('morgan'); // <-- Importa o Morgan
const connectDB = require('./config/db'); // <-- Importa nossa função de conexão
const { configureCloudinary } = require('./config/cloudinaryConfig');

// 2. CONFIGURAÇÃO INICIAL
dotenv.config({ path: './.env', quiet: true }); // Carrega as variáveis de ambiente

connectDB(); // <-- Executa a conexão com o banco de dados

configureCloudinary(); 

const app = express(); // Instancia o aplicativo Express

// 3. MIDDLEWARES
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Limita o tamanho do corpo da requisição para 10kb

// Middleware de Logging: só roda em ambiente de desenvolvimento
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

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