const transactionService = require('../services/transactionService');

exports.createTransaction = async (req, res) => {
    try {
        const newTransaction = await transactionService.createTransaction(req.body);
        res.status(201).json({ status: 'success', data: { transaction: newTransaction } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await transactionService.getAllTransactions();
        res.status(200).json({ status: 'success', results: transactions.length, data: { transactions } });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: 'Erro ao buscar as transações.' });
    }
};

exports.getTransactionById = async (req, res) => {
    try {
        const transaction = await transactionService.getTransactionById(req.params.id);
        res.status(200).json({ status: 'success', data: { transaction } });
    } catch (error) {
        res.status(404).json({ status: 'fail', message: error.message });
    }
};

exports.updateTransaction = async (req, res) => {
    try {
        const transaction = await transactionService.updateTransaction(req.params.id, req.body);
        res.status(200).json({ status: 'success', data: { transaction } });
    } catch (error) {
        res.status(404).json({ status: 'fail', message: error.message });
    }
};

exports.deleteTransaction = async (req, res) => {
    try {
        await transactionService.deleteTransaction(req.params.id);
        res.status(204).json({ status: 'success', data: null });
    } catch (error) {
        res.status(404).json({ status: 'fail', message: error.message });
    }
};