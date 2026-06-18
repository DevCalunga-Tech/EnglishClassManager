const EnrollmentModel = require('../models/enrollmentModel');

const enrollmentController = {
  // Efetuar matrícula
  enrollStudent: async (req, res) => {
    try {
      const { student_id, class_id } = req.body;

      if (!student_id || !class_id) {
        return res.status(400).json({ error: 'Os campos student_id e class_id são obrigatórios.' });
      }

      // 1. Verificar se o aluno já está matriculado nesta turma
      const alreadyEnrolled = await EnrollmentModel.checkExists(student_id, class_id);
      if (alreadyEnrolled) {
        return res.status(400).json({ error: 'Este estudante já está matriculado nesta turma.' });
      }

      // 2. Criar matrícula no banco
      const enrollmentId = await EnrollmentModel.create(student_id, class_id);

      res.status(201).json({
        message: 'Estudante matriculado com sucesso nesta turma!',
        enrollmentId
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao processar matrícula.', details: error.message });
    }
  },

  // Obter todos os estudantes de uma turma
  getClassStudents: async (req, res) => {
    try {
      const { classId } = req.params;
      const students = await EnrollmentModel.findStudentsInClass(classId);
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar alunos da turma.', details: error.message });
    }
  },

  // Obter todas as turmas de um estudante
  getStudentClasses: async (req, res) => {
    try {
      const { studentId } = req.params;
      const classes = await EnrollmentModel.findClassesOfStudent(studentId);
      res.json(classes);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao procurar turmas do estudante.', details: error.message });
    }
  },

  // Cancelar matrícula
  unenrollStudent: async (req, res) => {
    try {
      const { id } = req.params;
      const success = await EnrollmentModel.delete(id);

      if (!success) {
        return res.status(404).json({ error: 'Matrícula não encontrada.' });
      }

      res.json({ message: 'Matrícula cancelada com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao cancelar matrícula.', details: error.message });
    }
  }
};

module.exports = enrollmentController;