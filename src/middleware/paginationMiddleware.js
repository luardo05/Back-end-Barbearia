// File: src/api/middleware/paginationMiddleware.js

// O middleware agora aceita um segundo argumento opcional 'populateOptions'
exports.paginate = (model, populateOptions = null, sortOptions = null, filterCallback = null) => async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    try {
        const filter = filterCallback ? filterCallback(req) : {};

        // O filtro é aplicado tanto na contagem de documentos quanto na busca.
        const totalDocuments = await model.countDocuments(filter);
        
        let query = model.find(filter).skip(skip).limit(limit);
        // --- LÓGICA DEFENSIVA ---
        // Apenas tenta popular se 'populateOptions' foi realmente fornecido.
        if (populateOptions) {
            query = query.populate(populateOptions);
        }

        // Apenas tenta ordenar se 'sortOptions' foi realmente fornecido.
        if (sortOptions) {
            query = query.sort(sortOptions);
        }

        const results = await query;

        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(totalDocuments / limit),
            totalDocuments: totalDocuments,
        };
        
        res.paginatedResults = {
            status: 'success',
            pagination,
            data: results,
        };
        
        next();
    } catch (error) {
        // Adicionando mais detalhes ao log de erro para futuras depurações
        console.error("Erro no middleware de paginação:", error);
        res.status(500).json({ status: 'fail', message: `Erro interno no servidor: ${error.message}` });
    }
};