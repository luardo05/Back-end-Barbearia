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