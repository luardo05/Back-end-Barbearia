// 1. IMPORTAÇÕES
const express = require('express'); //para o servidor
const dotenv = require('dotenv'); // para usar as variáveis de ambiente
const cors = require('cors'); // para evitar erro de cors
const helmet = require('helmet'); // <-- Importa o Helmet
const morgan = require('morgan'); // <-- Importa o Morgan
const connectDB = require('./config/db'); // <-- Importa nossa função de conexão
const { configureCloudinary } = require('./config/cloudinaryConfig');

// IMPORTAR ROTAS
const authRoutes = require('./api/routes/authRoutes');
const userRoutes = require('./api/routes/userRoutes');
const serviceRoutes = require('./api/routes/serviceRoutes');
const appointmentRoutes = require('./api/routes/appointmentRoutes');
const transactionRoutes = require('./api/routes/transactionRoutes');
const notificationRoutes = require('./api/routes/notificationRoutes');
const dashboardRoutes = require('./api/routes/dashboardRoutes');
const disponibilidadeRoutes = require('./api/routes/disponibilidadeRoutes'); 

// 2. CONFIGURAÇÃO INICIAL
dotenv.config({ path: './.env' }); // Carrega as variáveis de ambiente

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
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/disponibilidade', disponibilidadeRoutes);

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'API da Barbearia no ar!'
    });
});


// 5. INICIALIZAÇÃO DO SERVIDOR
const http = require('http');
const { initSocket } = require('./socketManager'); // <-- Importamos nosso futuro gerenciador

const server = http.createServer(app); // <-- Criamos um servidor HTTP a partir do nosso app Express

const io = initSocket(server); // <-- Inicializamos o Socket.IO e passamos o servidor

const port = process.env.PORT || 3000;
server.listen(port, () => { // <-- Usamos server.listen() em vez de app.listen()
    console.log(`🚀 Servidor rodando na porta ${port}...`);
});

module.exports = app;