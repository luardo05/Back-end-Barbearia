const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Removemos as opções depreciadas (useNewUrlParser, useUnifiedTopology)
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`✅ Conexão com o MongoDB estabelecida com sucesso: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Erro ao conectar com o MongoDB: ${error.message}`);
        // Encerra a aplicação com falha se não conseguir conectar ao DB
        process.exit(1);
    }
};

module.exports = connectDB;