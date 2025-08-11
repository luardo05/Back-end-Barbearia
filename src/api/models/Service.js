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
    },
    imagemUrl: {
        type: String,
        default: 'url_da_imagem_de_servico_padrao_aqui'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Service', ServiceSchema);