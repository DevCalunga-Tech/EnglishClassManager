const db = require('../config/db');

const StudentModel = {
  // Listar todos os estudantes
  findAll: async () => {
    const [rows] = await db.execute('SELECT * FROM students ORDER BY name ASC');
    return rows;
  },

  // Encontrar um estudante específico pelo ID
  findById: async (id) => {
    const [rows] = await db.execute('SELECT * FROM students WHERE id = ?', [id]);
    return rows[0];
  },

  // Verificar se um e-mail já está registado (para evitar duplicados)
  findByEmail: async (email) => {
    const [rows] = await db.execute('SELECT * FROM students WHERE email = ?', [email]);
    return rows[0];
  },

  // Cadastrar um novo estudante
  create: async (name, email, phone, level) => {
    const query = `
      INSERT INTO students (name, email, phone, level) 
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [name, email, phone, level]);
    return result.insertId;
  },

  // Atualizar dados de um estudante
  update: async (id, name, email, phone, level) => {
    const query = `
      UPDATE students 
      SET name = ?, email = ?, phone = ?, level = ? 
      WHERE id = ?
    `;
    const [result] = await db.execute(query, [name, email, phone, level, id]);
    return result.affectedRows > 0;
  },

  // Eliminar um estudante
  delete: async (id) => {
    const [result] = await db.execute('DELETE FROM students WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = StudentModel;