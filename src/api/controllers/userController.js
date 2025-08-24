const userService = require('../services/userService');

// Note: O createUser foi movido para o authController (register), que é o lugar correto.
// Esta função abaixo seria para um admin criar um usuário.
exports.adminCreateUser = async (req, res) => {
    try {
        const newUser = await userService.createUser(req.body);
        // A senha já é omitida pelo model, então podemos retornar o objeto diretamente.
        res.status(201).json({ status: 'success', data: { user: newUser } });
    } catch (error) {
        // Trata erros de validação (ex: e-mail duplicado) do Mongoose.
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    // Verifica se a resposta já foi preparada pelo middleware de paginação
    if (res.paginatedResults) {
        return res.status(200).json(res.paginatedResults);
    }

    // Se não foi paginada, busca todos os usuários através do serviço
    try {
        const users = await userService.findAllUsers();
        res.status(200).json({
            status: 'success',
            // --- CORREÇÃO APLICADA AQUI ---
            // Inclui um objeto 'pagination' padrão para consistência.
            pagination: {
                currentPage: 1,
                totalPages: 1,
                totalDocuments: users.length
            },
            data: users
        });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: 'Erro ao buscar usuários.' });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        res.status(200).json({ status: 'success', data: { user } });
    } catch (error) {
        res.status(404).json({ status: 'fail', message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body);
        res.status(200).json({ status: 'success', data: { user } });
    } catch (error) {
        res.status(404).json({ status: 'fail', message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        res.status(204).json({ status: 'success', data: null }); // 204 No Content
    } catch (error) {
        res.status(404).json({ status: 'fail', message: error.message });
    }
};