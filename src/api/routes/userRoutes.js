const express = require('express');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../../middleware/authMiddleware');
const { paginate } = require('../../middleware/paginationMiddleware'); // <-- Importa
const User = require('../models/User');

const router = express.Router();

// Middleware condicional para paginação
const conditionalPagination = (req, res, next) => {
    // Se a query string 'paginated' for 'false', pula o middleware de paginação
    if (req.query.paginated === 'false') {
        return next();
    }
    // Caso contrário, executa o middleware de paginação normalmente
    return paginate(User)(req, res, next);
};

// A partir deste ponto, todas as rotas exigem que o usuário esteja logado (protect)
// e que seja um administrador (restrictTo).
router.use(protect);
router.use(restrictTo('admin'));

router.route('/')
    .get(conditionalPagination, userController.getAllUsers)
    .post(userController.adminCreateUser);

router.route('/:id')
    .get(userController.getUserById)
    .patch(userController.updateUser) // Usando PATCH para atualizações parciais
    .delete(userController.deleteUser);

module.exports = router;