const Transaction = require('../models/Transaction');

// CREATE
exports.createTransaction = async (transactionData) => {
    return await Transaction.create(transactionData);
};

// READ ALL
exports.getAllTransactions = async () => {
    // Usamos populate para enriquecer os dados, mostrando o nome do cliente
    return await Transaction.find().populate('cliente', 'nome').populate('agendamento');
};

// READ ONE
exports.getTransactionById = async (id) => {
    const transaction = await Transaction.findById(id).populate('cliente', 'nome').populate('agendamento');
    if (!transaction) {
        throw new Error('Nenhuma transação encontrada com este ID.');
    }
    return transaction;
};

// UPDATE
exports.updateTransaction = async (id, updateData) => {
    const transaction = await Transaction.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
    });
    if (!transaction) {
        throw new Error('Nenhuma transação encontrada com este ID.');
    }
    return transaction;
};

// DELETE
exports.deleteTransaction = async (id) => {
    const transaction = await Transaction.findByIdAndDelete(id);
    if (!transaction) {
        throw new Error('Nenhuma transação encontrada com este ID.');
    }
    return null; // Sucesso
};