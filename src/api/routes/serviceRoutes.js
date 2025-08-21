// File: src/api/routes/serviceRoutes.js
const express = require('express');
const serviceController = require('../controllers/serviceController');
const { protect, restrictTo } = require('../../middleware/authMiddleware');

const router = express.Router();

// --- Rotas Públicas (qualquer um pode ver os serviços) ---
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
router.get('/:id/price', serviceController.getPrecoDinamico);


// --- Rotas Protegidas (Apenas para Administradores) ---
// A partir deste ponto, todas as rotas abaixo exigem login (protect)
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', serviceController.createService);
router.patch('/:id', serviceController.updateService);
router.delete('/:id', serviceController.deleteService);

module.exports = router;