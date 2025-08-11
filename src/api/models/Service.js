const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'O nome do serviço é obrigatório.'],
        unique: true,
        trim: true
    },
    descricao: {
        type: String,
        required: [true, 'A descrição é obrigatória.']
    },
    preco: {
        type: Number,
        required: [true, 'O preço é obrigatório.']
    },
    duracaoEmMinutos: { // Essencial para a lógica do calendário
        type: Number,
        required: [true, 'A duração é obrigatória.']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Service', ServiceSchema);