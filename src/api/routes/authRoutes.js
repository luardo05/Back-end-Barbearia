const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

// Rota de exemplo para testar a proteção
router.get('/me', protect, (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            user: req.user // Retorna os dados do usuário que foram anexados pelo middleware 'protect'
        }
    });
});

module.exports = router;