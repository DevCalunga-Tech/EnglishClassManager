const db = require('../config/db');

const EnrollmentModel = {
  // Matricular um aluno numa turma
  create: async (student_id, class_id) => {
    const query = 'INSERT INTO enrollments (student_id, class_id) VALUES (?, ?)';
    const [result] = await db.execute(query, [student_id, class_id]);
    return result.insertId;
  },

  // Listar todos os alunos de uma turma específica (Muito usado pelos professores)
  findStudentsInClass: async (class_id) => {
    const query = `
      SELECT e.id AS enrollment_id, e.enrolled_at, s.id AS student_id, s.name, s.email, s.level
      FROM enrollments e
      INNER JOIN students s ON e.student_id = s.id
      WHERE e.class_id = ?
      ORDER BY s.name ASC
    `;
    const [rows] = await db.execute(query, [class_id]);
    return rows;
  },

  // Listar todas as turmas em que um aluno específico está matriculado
  findClassesOfStudent: async (student_id) => {
    const query = `
      SELECT e.id AS enrollment_id, c.id AS class_id, c.name, c.schedule, c.level
      FROM enrollments e
      INNER JOIN classes c ON e.class_id = c.id
      WHERE e.student_id = ?
    `;
    const [rows] = await db.execute(query, [student_id]);
    return rows;
  },

  // Cancelar/Remover uma matrícula
  delete: async (id) => {
    const [result] = await db.execute('DELETE FROM enrollments WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  // Verificar se já existe uma matrícula específica (Evita chamadas desnecessárias ao banco)
  checkExists: async (student_id, class_id) => {
    const query = 'SELECT * FROM enrollments WHERE student_id = ? AND class_id = ?';
    const [rows] = await db.execute(query, [student_id, class_id]);
    return rows[0];
  }
};

module.exports = EnrollmentModel;