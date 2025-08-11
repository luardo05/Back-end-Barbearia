const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    destinatario: { // O usuário que receberá a notificação
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    mensagem: {
        type: String,
        required: true
    },
    lida: {
        type: Boolean,
        default: false
    },
    // Campo opcional para levar o usuário a uma página específica ao clicar
    link: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', NotificationSchema);