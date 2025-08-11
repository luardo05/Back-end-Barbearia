// File: src/config/cloudinaryConfig.js
const cloudinary = require('cloudinary').v2;

const configureCloudinary = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('✅ Configuração do Cloudinary estabelecida com sucesso!');
};

module.exports = { cloudinary, configureCloudinary };