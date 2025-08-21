const express = require('express');
const transactionController = require('../controllers/transactionController');
const { protect, restrictTo } = require('../../middleware/authMiddleware');

const router = express.Router();

// APLICAÇÃO DE SEGURANÇA:
// Todas as rotas definidas neste arquivo exigem que o usuário esteja logado
// E que o usuário tenha o papel de 'admin'.
router.use(protect);
router.use(restrictTo('admin'));

router.route('/')
    .get(transactionController.getAllTransactions)
    .post(transactionController.createTransaction);

router.route('/:id')
    .get(transactionController.getTransactionById)
    .patch(transactionController.updateTransaction)
    .delete(transactionController.deleteTransaction);

module.exports = router;