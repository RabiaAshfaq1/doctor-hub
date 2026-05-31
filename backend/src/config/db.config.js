require('dotenv').config();

module.exports = {
  dialect: process.env.DB_DIALECT || 'sqlite',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT,
  database: process.env.DB_NAME || 'doctor_hub',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  storage: process.env.DB_STORAGE || './database.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
