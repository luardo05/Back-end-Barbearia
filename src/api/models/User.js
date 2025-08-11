const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'O nome é obrigatório.'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'O e-mail é obrigatório.'],
        unique: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Por favor, insira um e-mail válido.']
    },
    senha: {
        type: String,
        required: [true, 'A senha é obrigatória.'],
        select: false // Garante que a senha não retorne em queries por padrão
    },
    dataNascimento: {
        type: Date,
        required: [true, 'A data de nascimento é obrigatória.']
    },
    numeroTelefone: {
        type: String,
        required: [true, 'O número de telefone é obrigatório.']
    },
    role: {
        type: String,
        enum: ['cliente', 'admin'], // Apenas estes dois valores são permitidos
        default: 'cliente'
    },
    fotoUrl: {
        type: String,
        default: 'url_da_imagem_padrao_aqui' // Link para uma imagem de avatar padrão
    }
}, {
    timestamps: true // Adiciona os campos createdAt e updatedAt automaticamente
});

// Middleware (hook) do Mongoose para criptografar a senha ANTES de salvar
UserSchema.pre('save', async function (next) {
    // Roda este código apenas se a senha foi modificada (ou é nova)
    if (!this.isModified('senha')) return next();

    // Gera o hash da senha com um custo de 12
    this.senha = await bcrypt.hash(this.senha, 12);
    next();
});

module.exports = mongoose.model('User', UserSchema);