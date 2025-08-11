const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    valor: {
        type: Number,
        required: [true, 'O valor da transação é obrigatório.']
    },
    descricao: {
        type: String,
        required: [true, 'A descrição da transação é obrigatória.'] // Ex: "Corte Masculino", "Venda de Produto"
    },
    tipo: {
        type: String,
        enum: ['online', 'presencial'], // Essencial para o dashboard
        required: true
    },
    agendamento: { // Link opcional para o agendamento que gerou esta transação
        type: mongoose.Schema.ObjectId,
        ref: 'Appointment'
    },
    cliente: { // Link opcional para o usuário do sistema
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', TransactionSchema);