const mysql = require('mysql2/promise');
require('dotenv').config();

// Criar a pool de conexões com o MySQL do XAMPP
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Número máximo de conexões simultâneas
  queueLimit: 0
});

// Função auxiliar para testar a conexão ao inicializar o servidor
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(' Conexão ao MySQL (XAMPP) estabelecida com sucesso!');
    connection.release(); // Liberta a conexão de volta para a pool
  } catch (error) {
    console.error(' Erro crucial ao conectar à Base de Dados:', error.message);
    process.exit(1); // Fecha a aplicação caso o XAMPP esteja desligado
  }
};

testConnection();

module.exports = pool;