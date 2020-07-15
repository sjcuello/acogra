require('dotenv').config();

const config ={
    authJwtSecretServer: process.env.AUTH_JWT_SECRET_SERVER,
    authJwtSecretClient: process.env.AUTH_JWT_SECRET_CLIENT
};

module.exports = {config:config};