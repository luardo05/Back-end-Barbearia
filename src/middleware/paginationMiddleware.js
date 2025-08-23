// File: src/api/middleware/paginationMiddleware.js

// O middleware agora aceita um segundo argumento opcional 'populateOptions'
exports.paginate = (model, populateOptions) => async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    try {
        const totalDocuments = await model.countDocuments();
        
        // Constrói a query inicial
        let query = model.find().skip(skip).limit(limit);

        // Se opções de populate foram fornecidas, aplica-as
        if (populateOptions) {
            query = query.populate(populateOptions);
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
        res.status(500).json({ status: 'fail', message: error.message });
    }
};