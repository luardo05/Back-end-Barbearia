const authService = require('../services/authService');

exports.register = async (req, res) => {
    try {
        const newUser = await authService.registerUser(req.body);

        // Geramos um token para o usuário recém-registrado para que ele não precise fazer login novamente
        const token = authService.signToken(newUser._id);

        res.status(201).json({
            status: 'success',
            token,
            data: {
                user: newUser
            }
        });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, senha } = req.body;
        const token = await authService.loginUser(email, senha);

        res.status(200).json({
            status: 'success',
            token
        });
    } catch (error) {
        // Usamos 401 para falhas de autenticação
        res.status(401).json({ status: 'fail', message: error.message });
    }
};