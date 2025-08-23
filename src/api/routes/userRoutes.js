const express = require('express');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../../middleware/authMiddleware');
const { paginate } = require('../../middleware/paginationMiddleware'); // <-- Importa
const User = require('../models/User');

const router = express.Router();

// A partir deste ponto, todas as rotas exigem que o usuário esteja logado (protect)
// e que seja um administrador (restrictTo).
router.use(protect);
router.use(restrictTo('admin'));

router.route('/')
    .get(paginate(User), userController.getAllUsers)
    .post(userController.adminCreateUser);

router.route('/:id')
    .get(userController.getUserById)
    .patch(userController.updateUser) // Usando PATCH para atualizações parciais
    .delete(userController.deleteUser);

module.exports = router;