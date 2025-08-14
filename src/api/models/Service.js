const mongoose = require('mongoose');

// Definimos um Schema para o sub-documento que representará uma regra de preço.
// Sub-documento para as regras de preço
const PrecoRegraSchema = new mongoose.Schema({
    // Usaremos o padrão Date.getDay(): 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    diaDaSemana: {
        type: Number,
        required: true,
        min: 0,
        max: 6
    },
    precoEspecial: {
        type: Number,
        required: true
    }
}, { _id: false });

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
    precoBase: {
        type: Number,
        required: [true, 'O preço base é obrigatório.']
    },
    regrasDePreco: [PrecoRegraSchema], // O serviço agora pode ter um array de regras de preço.
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