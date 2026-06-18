const db = require('../config/db');

const FeedbackModel = {
  // Criar um novo relatório de acompanhamento
  create: async (student_id, teacher_id, comments, behavior) => {
    const query = `
      INSERT INTO feedbacks (student_id, teacher_id, comments, behavior) 
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [student_id, teacher_id, comments, behavior || 'good']);
    return result.insertId;
  },

  // Listar todo o histórico de acompanhamento de um estudante específico
  findByStudent: async (student_id) => {
    const query = `
      SELECT f.id AS feedback_id, f.comments, f.behavior, f.created_at, u.name AS teacher_name
      FROM feedbacks f
      INNER JOIN users u ON f.teacher_id = u.id
      WHERE f.student_id = ?
      ORDER BY f.created_at DESC
    `;
    const [rows] = await db.execute(query, [student_id]);
    return rows;
  },

  // Eliminar um feedback
  delete: async (id) => {
    const [result] = await db.execute('DELETE FROM feedbacks WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = FeedbackModel;