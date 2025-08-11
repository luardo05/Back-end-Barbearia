const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// Função auxiliar para assinar o token JWT
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

exports.registerUser = async (userData) => {
    // A criptografia da senha já é feita pelo 'pre-save' hook no User model
    const newUser = await User.create(userData);
    // Não retornamos a senha
    newUser.senha = undefined;
    return newUser;
};

exports.loginUser = async (email, password) => {
    if (!email || !password) {
        throw new Error('Por favor, forneça e-mail e senha.');
    }

    // 1. Verificar se o usuário existe e buscar a senha
    const user = await User.findOne({ email }).select('+senha');

    if (!user) {
        throw new Error('Credenciais inválidas.');
    }

    // 2. Verificar se a senha está correta
    const isCorrect = await bcrypt.compare(password, user.senha);

    if (!isCorrect) {
        throw new Error('Credenciais inválidas.');
    }

    // 3. Se tudo estiver ok, gerar e retornar o token
    const token = signToken(user._id);
    return token;
};