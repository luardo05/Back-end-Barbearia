const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    // 1. Pegar o token do cabeçalho
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ status: 'fail', message: 'Você não está logado. Por favor, faça o login para obter acesso.' });
    }

    try {
        // 2. Verificar o token
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);

        // 3. Verificar se o usuário ainda existe
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({ status: 'fail', message: 'O usuário pertencente a este token não existe mais.' });
        }

        // 4. Anexar o usuário à requisição para uso posterior
        req.user = currentUser;
        next(); // Permite o acesso à próxima função (o controller)
    } catch (error) {
        return res.status(401).json({ status: 'fail', message: 'Token inválido ou expirado.' });
    }
};