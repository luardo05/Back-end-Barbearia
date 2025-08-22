// File: src/socketManager.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./api/models/User');

let io;

// Middleware de autenticação para Socket.IO
const socketAuth = async (socket, next) => {
    // O token JWT será enviado pelo cliente na hora da conexão
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error('Authentication error: Token not provided.'));
    }

    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(decoded.id);

        if (!currentUser) {
            return next(new Error('Authentication error: User not found.'));
        }

        // Anexamos o usuário ao objeto do socket para uso posterior
        socket.user = currentUser;
        next();
    } catch (error) {
        return next(new Error('Authentication error: Invalid token.'));
    }
};

exports.initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", // Em produção, mude para o domínio do seu frontend
            methods: ["GET", "POST"]
        }
    });

    // Aplica o middleware de autenticação a cada nova conexão
    io.use(socketAuth);

    io.on('connection', (socket) => {
        console.log(`✅ Usuário conectado via Socket: ${socket.user.nome} (ID: ${socket.id})`);

        // Cada usuário entra em uma "sala" privada com seu próprio ID.
        // Isso permite que enviemos notificações diretas para um usuário específico.
        socket.join(socket.user.id.toString());

        // Se o usuário for um admin, ele também entra na sala de administradores.
        if (socket.user.role === 'admin') {
            socket.join('admins');
            console.log(`🔑 Usuário ${socket.user.nome} entrou na sala de admins.`);
        }

        socket.on('disconnect', () => {
            console.log(`❌ Usuário desconectado: ${socket.user.nome} (ID: ${socket.id})`);
        });
    });

    return io;
};

// Função para permitir que nossos serviços acessem a instância do 'io'
exports.getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};