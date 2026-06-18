const db = require('../config/db');

const GradeModel = {
  // Lançar a nota de um estudante
  create: async (student_id, class_id, title, score, weight) => {
    const query = `
      INSERT INTO grades (student_id, class_id, title, score, weight) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [student_id, class_id, title, score, weight || 1.00]);
    return result.insertId;
  },

  // Procurar o histórico de notas de um estudante específico numa turma
  findByStudentAndClass: async (student_id, class_id) => {
    const query = `
      SELECT id, title, score, weight, created_at 
      FROM grades 
      WHERE student_id = ? AND class_id = ?
      ORDER BY created_at DESC
    `;
    const [rows] = await db.execute(query, [student_id, class_id]);
    return rows;
  },

  // Listar todas as notas de uma turma com IDs individuais
  findByClass: async (class_id) => {
    const query = `
      SELECT 
        g.id,
        g.student_id,
        s.name AS student_name,
        g.title,
        g.score,
        g.weight,
        g.created_at
      FROM grades g
      INNER JOIN students s ON g.student_id = s.id
      WHERE g.class_id = ?
      ORDER BY g.created_at DESC, s.name ASC
    `;
    const [rows] = await db.execute(query, [class_id]);
    return rows;
  },

  // Obter a pauta/relatório de notas de uma turma inteira com cálculo da média ponderada
  findClassGradesReport: async (class_id) => {
    const query = `
      SELECT 
        s.id AS student_id,
        s.name AS student_name,
        GROUP_CONCAT(CONCAT(g.title, ': ', g.score) SEPARATOR ' | ') AS all_grades,
        ROUND(SUM(g.score * g.weight) / SUM(g.weight), 2) AS weighted_average
      FROM students s
      INNER JOIN enrollments e ON s.id = e.student_id
      LEFT JOIN grades g ON s.id = g.student_id AND g.class_id = ?
      WHERE e.class_id = ?
      GROUP BY s.id
      ORDER BY s.name ASC
    `;
    const [rows] = await db.execute(query, [class_id, class_id]);
    return rows;
  },

  // Eliminar uma nota lançada incorretamente
  delete: async (id) => {
    const [result] = await db.execute('DELETE FROM grades WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = GradeModel;