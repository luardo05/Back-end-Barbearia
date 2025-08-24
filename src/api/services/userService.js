const User = require('../models/User');
const { cloudinary } = require('../../config/cloudinaryConfig');

const bufferToDataURI = (buffer) => `data:image/png;base64,${buffer.toString('base64')}`;

// CREATE
exports.createUser = async (userData) => {
    // A verificação de e-mail duplicado já é tratada pelo Mongoose ('unique: true')
    // e resultará em um erro que nosso controller irá capturar.
    return await User.create(userData);
};

// READ ALL
// exports.getAllUsers = async () => {
//     // O select('-senha') no controller era bom, mas o model já faz isso com 'select: false'.
//     return await User.find();
// };

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

exports.findAllUsers = async () => {
    return await User.find();
};

exports.updateProfilePhoto = async (userId, fileBuffer) => {
    const fileDataUri = bufferToDataURI(fileBuffer);

    // Faz o upload para a pasta 'perfis' no Cloudinary
    const uploadResult = await cloudinary.uploader.upload(fileDataUri, {
        folder: 'barbearia/perfis'
    });

    // Atualiza o documento do usuário com a URL segura retornada pelo Cloudinary
    return await User.findByIdAndUpdate(userId, { fotoUrl: uploadResult.secure_url }, { new: true });
};