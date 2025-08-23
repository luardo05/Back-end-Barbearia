const express = require('express');
const disponibilidadeController = require('../controllers/disponibilidadeController');

const router = express.Router();

// Rota pública para qualquer um ver os horários
router.get('/dia', disponibilidadeController.getAvailableTimes);

module.exports = router;