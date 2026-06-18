const db = require('../config/db');

const AttendanceModel = {
  // Registar a presença/falta de um aluno
  create: async (student_id, class_id, date, status) => {
    const query = `
      INSERT INTO attendance (student_id, class_id, date, status) 
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [student_id, class_id, date, status]);
    return result.insertId;
  },

  // Procurar registos de presença de uma turma numa data específica (Ver a chamada feita)
  findByClassAndDate: async (class_id, date) => {
    const query = `
      SELECT a.id AS attendance_id, a.date, a.status, s.id AS student_id, s.name 
      FROM attendance a
      INNER JOIN students s ON a.student_id = s.id
      WHERE a.class_id = ? AND a.date = ?
      ORDER BY s.name ASC
    `;
    const [rows] = await db.execute(query, [class_id, date]);
    return rows;
  },

  // Obter a percentagem de assiduidade de um aluno numa turma específica (Útil para relatórios)
  getStudentReport: async (student_id, class_id) => {
    const query = `
      SELECT 
        COUNT(*) AS total_classes,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS total_presents,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) AS total_absents,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) AS total_lates
      FROM attendance
      WHERE student_id = ? AND class_id = ?
    `;
    const [rows] = await db.execute(query, [student_id, class_id]);
    return rows[0];
  },

  // Eliminar ou corrigir um registo de presença
  delete: async (id) => {
    const [result] = await db.execute('DELETE FROM attendance WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = AttendanceModel;