const express = require('express');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../../middleware/authMiddleware');
const { paginate } = require('../../middleware/paginationMiddleware'); // <-- Importa
const upload = require('../../middleware/upload');
const User = require('../models/User');

const router = express.Router();

// Middleware condicional para paginação
const conditionalPagination = (req, res, next) => {
    if (req.query.paginated === 'false') {
        return next();
    }
    // Define as opções de ordenação
    const sortOptions = { nome: 1 }; // Ordenar por nome, ascendente
    // Passa as opções para o middleware
    return paginate(User, null, sortOptions)(req, res, next);
};

// A partir deste ponto, todas as rotas exigem que o usuário esteja logado (protect)
// e que seja um administrador (restrictTo).
router.use(protect);

router.patch('/updateMyPhoto', protect, upload.single('foto'), userController.updateMyProfilePhoto);

router.use(restrictTo('admin'));

router.route('/')
    .get(conditionalPagination, userController.getAllUsers)
    .post(userController.adminCreateUser);

router.route('/:id')
    .get(userController.getUserById)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;