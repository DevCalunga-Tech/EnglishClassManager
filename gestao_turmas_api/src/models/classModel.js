const db = require('../config/db');

const ClassModel = {
  // Listar todas as turmas com os dados do professor responsável
  findAll: async () => {
    const query = `
      SELECT c.*, u.name AS teacher_name, u.email AS teacher_email 
      FROM classes c
      LEFT JOIN users u ON c.teacher_id = u.id
    `;
    const [rows] = await db.execute(query);
    return rows;
  },

  // Encontrar uma turma específica pelo ID
  findById: async (id) => {
    const query = `
      SELECT c.*, u.name AS teacher_name 
      FROM classes c
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE c.id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  },

  // Criar uma nova turma
  create: async (name, schedule, level, teacher_id) => {
    const query = `
      INSERT INTO classes (name, schedule, level, teacher_id) 
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [name, schedule, level, teacher_id]);
    return result.insertId;
  },

  // Atualizar os dados de uma turma
  update: async (id, name, schedule, level, teacher_id) => {
    const query = `
      UPDATE classes 
      SET name = ?, schedule = ?, level = ?, teacher_id = ? 
      WHERE id = ?
    `;
    const [result] = await db.execute(query, [name, schedule, level, teacher_id, id]);
    return result.affectedRows > 0;
  },

  // Eliminar uma turma
  delete: async (id) => {
    const [result] = await db.execute('DELETE FROM classes WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = ClassModel;