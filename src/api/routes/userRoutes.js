const express = require('express');
const router = express.Router();
const { createUser} = require('../controllers/userController');

// Rotas de usuários
router.post('/', createUser);
module.exports = router;
