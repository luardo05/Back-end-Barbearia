// File: src/api/services/serviceService.js
const Service = require('../models/Service');

/**
 * Calcula o preço de um serviço para uma data específica, consultando as regras de preço.
 * @param {string} serviceId - O ID do serviço a ser consultado.
 * @param {Date} data - A data para a qual o preço deve ser calculado.
 * @returns {Promise<number>} O preço correto para a data fornecida.
 */

exports.getPrecoParaData = async (serviceId, data) => {
    const service = await Service.findById(serviceId);
    if (!service) {
        throw new Error('Serviço não encontrado.');
    }

    // O método getDay() retorna o dia da semana (0 para Domingo, 1 para Segunda, etc.)
    const diaDaSemana = data.getDay();

    // Procura no array de regras se existe uma regra para o dia da semana da data fornecida
    const regraEncontrada = service.regrasDePreco.find(
        (regra) => regra.diaDaSemana === diaDaSemana
    );

    // Se uma regra foi encontrada, seu preço especial é retornado
    if (regraEncontrada) {
        return regraEncontrada.precoEspecial;
    }

    // Se nenhuma regra específica for encontrada para o dia, o preço base é retornado
    return service.precoBase;
};

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


// LÓGICA DE PREÇO DINÂMICO (já criada anteriormente)
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