const User = require('../models/User');

// CREATE
exports.createUser = async (userData) => {
    // A verificação de e-mail duplicado já é tratada pelo Mongoose ('unique: true')
    // e resultará em um erro que nosso controller irá capturar.
    return await User.create(userData);
};

// READ ALL
exports.getAllUsers = async () => {
    // O select('-senha') no controller era bom, mas o model já faz isso com 'select: false'.
    return await User.find();
};

// READ ONE
exports.getUserById = async (id) => {
    const user = await User.findById(id);
    if (!user) {
        throw new Error('Nenhum usuário encontrado com este ID.');
    }
    return user;
};

// UPDATE
exports.updateUser = async (id, updateData) => {
    // ATENÇÃO: Se a senha estiver em updateData, o hook 'pre-save' no model fará o hash.
    // Usar findById e depois .save() garante que os hooks do Mongoose sejam acionados.
    const user = await User.findById(id);
    if (!user) {
        throw new Error('Nenhum usuário encontrado com este ID.');
    }

    // Atualiza os campos do usuário com os dados recebidos
    Object.assign(user, updateData);

    // Salva o usuário, acionando o hook de senha se ela foi modificada
    return await user.save();
};

// DELETE
exports.deleteUser = async (id) => {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
        throw new Error('Nenhum usuário encontrado com este ID.');
    }
    return null; // Sucesso
};