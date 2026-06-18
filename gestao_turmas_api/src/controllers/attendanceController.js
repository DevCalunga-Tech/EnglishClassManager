const AttendanceModel = require('../models/attendanceModel');

const attendanceController = {
  // Lançar a chamada da turma (Recebe uma lista de presenças)
  takeAttendance: async (req, res) => {
    try {
      const { class_id, date, records } = req.body; 
      // 'records' deve ser um array: [{ student_id: 1, status: 'present' }, { student_id: 2, status: 'absent' }]

      // 1. Validações básicas
      if (!class_id || !date || !records || !Array.isArray(records)) {
        return res.status(400).json({ error: 'Dados incompletos. Informe class_id, date e a lista de records.' });
      }

      const allowedStatus = ['present', 'absent', 'late'];

      // 2. Loop para inserir cada registo no banco
      for (const record of records) {
        if (!allowedStatus.includes(record.status)) {
          return res.status(400).json({ error: `Status inválido para o estudante ID ${record.student_id}. Use: present, absent ou late.` });
        }
        // Salva na tabela do MySQL
        await AttendanceModel.create(record.student_id, class_id, date, record.status);
      }

      res.status(201).json({ message: 'Chamada registada com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao registar presenças.', details: error.message });
    }
  },

  // Obter o histórico de chamadas de uma turma numa data
  getClassAttendanceByDate: async (req, res) => {
    try {
      const { classId } = req.params;
      const { date } = req.query; // Pega a data via Query String (?date=2026-06-09)

      if (!date) {
        return res.status(400).json({ error: 'É necessário passar a data na URL (Ex: ?date=2026-06-09).' });
      }

      const attendanceList = await AttendanceModel.findByClassAndDate(classId, date);
      res.json(attendanceList);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao procurar lista de presenças.', details: error.message });
    }
  },

  // Obter relatório/estatística de faltas de um aluno específico
  getStudentAttendanceReport: async (req, res) => {
    try {
      const { studentId, classId } = req.params;
      const report = await AttendanceModel.getStudentReport(studentId, classId);
      
      // Calcular a percentagem de presença de forma simples
      const total = report.total_classes;
      const presents = parseInt(report.total_presents) + parseInt(report.total_lates); // Atraso conta como presença
      const attendancePercentage = total > 0 ? ((presents / total) * 100).toFixed(2) + '%' : '0.00%';

      res.json({
        ...report,
        attendance_rate: attendancePercentage
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao gerar relatório do estudante.', details: error.message });
    }
  }
};

module.exports = attendanceController;