const express = require('express');
const router = express.Router();
const { createUser} = require('../controllers/userController');

// Rotas de usuários


// Criar usuário
router.post('/', createUser);

// Listar todos os usuários
router.get("/", getAllUsers);

// Buscar usuário por ID
router.get("/:id", getUserById);

// Atualizar usuário
router.put("/:id", updateUser);

// Deletar usuário
router.delete("/:id", deleteUser);

module.exports = router;