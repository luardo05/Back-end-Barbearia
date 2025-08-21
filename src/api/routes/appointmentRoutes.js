const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const { protect, restrictTo } = require('../../middleware/authMiddleware');

const router = express.Router();

// A partir daqui, TODAS as rotas de agendamento exigem que o usuário esteja logado.
router.use(protect);

// --- Rotas para Clientes ---
router.post('/', appointmentController.createAppointment);
router.get('/my-appointments', appointmentController.getMyAppointments);
router.patch('/:id/cancel', appointmentController.cancelMyAppointment);

// --- Rotas Apenas para Administradores ---
router.use(restrictTo('admin'));

router.get('/', appointmentController.getAllAppointments);
router.post('/admin-create', appointmentController.adminCreateAppointment);
router.patch('/:id/status', appointmentController.updateAppointmentStatus);

module.exports = router;