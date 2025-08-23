const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const { protect, restrictTo } = require('../../middleware/authMiddleware');
const { paginate } = require('../../middleware/paginationMiddleware'); // <-- Importa
const Appointment = require('../models/Appointment');

const router = express.Router();

const populateOptions = [
    { path: 'cliente', select: 'nome' },
    { path: 'servico', select: 'nome' }
];

// A partir daqui, TODAS as rotas de agendamento exigem que o usuário esteja logado.
router.use(protect);

// --- Rotas para Clientes ---
router.post('/', appointmentController.createAppointment);
router.get('/my-appointments', appointmentController.getMyAppointments);
router.patch('/:id/cancel', appointmentController.cancelMyAppointment);

// --- Rotas Apenas para Administradores ---
router.use(restrictTo('admin'));

router.get('/', paginate(Appointment, populateOptions), appointmentController.getAllAppointments);
router.post('/admin-create', appointmentController.adminCreateAppointment);
router.patch('/:id/status', appointmentController.updateAppointmentStatus);

module.exports = router;