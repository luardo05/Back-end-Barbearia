// File: src/api/services/serviceService.js
const Service = require('../models/Service');
const { cloudinary } = require('../../config/cloudinaryConfig');

const bufferToDataURI = (buffer) => `data:image/png;base64,${buffer.toString('base64')}`;

// CREATE
exports.createService = async (serviceData) => {
    return await Service.create(serviceData);
};

// READ ALL
exports.getAllServices = async () => {
    return await Service.find();
};

// READ ONE
exports.getServiceById = async (id) => {
    const service = await Service.findById(id);
    if (!service) {
        throw new Error('Nenhum serviço encontrado com este ID.');
    }
    return service;
};

// UPDATE
exports.updateService = async (id, updateData) => {
    const service = await Service.findByIdAndUpdate(id, updateData, {
        new: true, // Retorna o documento modificado
        runValidators: true // Roda as validações do Schema na atualização
    });
    if (!service) {
        throw new Error('Nenhum serviço encontrado com este ID.');
    }
    return service;
};

// DELETE
exports.deleteService = async (id) => {
    const service = await Service.findByIdAndDelete(id);
    if (!service) {
        throw new Error('Nenhum serviço encontrado com este ID.');
    }
    // Retornamos null pois o documento foi deletado com sucesso
    return null;
};


// LÓGICA DE PREÇO DINÂMICO
exports.getPrecoParaData = async (serviceId, data) => {
    const service = await Service.findById(serviceId);
    if (!service) {
        throw new Error('Serviço não encontrado.');
    }
    const diaDaSemana = data.getDay();
    const regraEncontrada = service.regrasDePreco.find(
        (regra) => regra.diaDaSemana === diaDaSemana
    );
    if (regraEncontrada) {
        return regraEncontrada.precoEspecial;
    }
    return service.precoBase;
};

exports.updateServiceImage = async (serviceId, fileBuffer) => {
    const fileDataUri = bufferToDataURI(fileBuffer);

    const uploadResult = await cloudinary.uploader.upload(fileDataUri, {
        folder: 'barbearia/servicos'
    });

    return await Service.findByIdAndUpdate(serviceId, { imageUrl: uploadResult.secure_url }, { new: true });
};