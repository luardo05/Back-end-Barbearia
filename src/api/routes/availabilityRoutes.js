const express = require('express');
// Importa apenas o controller unificado
const availabilityController = require('../controllers/availabilityController');
const { protect, restrictTo } = require('../../middleware/authMiddleware');

const router = express.Router();

// --- ROTA PÚBLICA ---
// Rota para o cliente buscar os horários VAGOS (slots) de um dia.
router.get('/slots', availabilityController.getAvailableSlots);


// --- ROTAS PROTEGIDAS (Exigem login) ---
router.use(protect);

// Rotas para o admin ou cliente logado verem as configurações de disponibilidade.
router.get('/month', availabilityController.getAvailabilityForMonth);
router.get('/day', availabilityController.getAvailabilityForDate);


// --- ROTA EXCLUSIVA PARA ADMINS ---
// Rota para o admin salvar/modificar as configurações de disponibilidade.
router.post('/', restrictTo('admin'), availabilityController.setAvailability);


module.exports = router;