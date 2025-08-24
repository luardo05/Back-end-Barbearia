// File: src/api/routes/serviceRoutes.js
const express = require('express');
const serviceController = require('../controllers/serviceController');
const { protect, restrictTo } = require('../../middleware/authMiddleware');
const upload = require('../../middleware/upload');

const router = express.Router();

// --- Rotas Públicas (qualquer um pode ver os serviços) ---
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);

// --- Rotas Protegidas (Apenas para Administradores) ---
// A partir deste ponto, todas as rotas abaixo exigem login (protect)
router.use(protect);
router.get('/:id/price', serviceController.getPrecoDinamico);

router.use(restrictTo('admin'));

router.patch('/:id/image', protect, restrictTo('admin'), upload.single('imagem'), serviceController.updateServiceImage);
router.post('/', serviceController.createService);
router.patch('/:id', serviceController.updateService);
router.delete('/:id', serviceController.deleteService);

module.exports = router;