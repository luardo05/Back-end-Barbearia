const serviceService = require('../services/serviceService');

exports.createService = async (req, res) => {
    try {
        const newService = await serviceService.createService(req.body);
        res.status(201).json({ status: 'success', data: { service: newService } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

exports.getAllServices = async (req, res) => {
    try {
        const services = await serviceService.getAllServices();
        res.status(200).json({ status: 'success', results: services.length, data: { services } });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: 'Erro ao buscar os serviços.' });
    }
};

exports.getServiceById = async (req, res) => {
    try {
        const service = await serviceService.getServiceById(req.params.id);
        res.status(200).json({ status: 'success', data: { service } });
    } catch (error) {
        res.status(404).json({ status: 'fail', message: error.message });
    }
};

exports.updateService = async (req, res) => {
    try {
        const service = await serviceService.updateService(req.params.id, req.body);
        res.status(200).json({ status: 'success', data: { service } });
    } catch (error) {
        res.status(404).json({ status: 'fail', message: error.message });
    }
};

exports.deleteService = async (req, res) => {
    try {
        await serviceService.deleteService(req.params.id);
        res.status(204).json({ status: 'success', data: null }); // 204 No Content
    } catch (error) {
        res.status(404).json({ status: 'fail', message: error.message });
    }
};

exports.getPrecoDinamico = async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ status: 'fail', message: 'A data é obrigatória na query string.' });
        }

        const dataCalculo = new Date(date);
        // const preco = await serviceService.getPrecoParaData(id, dataCalculo);

        // res.status(200).json({
        //     status: 'success',
        //     data: {
        //         preco: preco
        //     }
        // });

        const precoDetalhado = await serviceService.getPrecoDetalhado(id, dataCalculo, req.user);
        res.status(200).json({ status: 'success', data: precoDetalhado });

    } catch (error) {
        res.status(404).json({ status: 'fail', message: error.message });
    }
};

exports.updateServiceImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ status: 'fail', message: 'Nenhum arquivo enviado.' });
    }
    try {
        const service = await serviceService.updateServiceImage(req.params.id, req.file.buffer);
        res.status(200).json({ status: 'success', data: { service } });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
    }
};