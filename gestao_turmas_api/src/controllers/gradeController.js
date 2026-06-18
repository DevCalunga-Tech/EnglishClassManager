const GradeModel = require('../models/gradeModel');

const gradeController = {
  // Lançar uma nova nota
  addGrade: async (req, res) => {
    try {
      const { student_id, class_id, title, assessment_type, type, score, weight } = req.body;
      const finalTitle = title || assessment_type || type;

      // 1. Validação de campos obrigatórios
      if (!student_id || !class_id || !finalTitle || score === undefined) {
        return res.status(400).json({ error: 'Os campos student_id, class_id, title e score são obrigatórios.' });
      }

      // 2. Validar o limite da nota (Exemplo: escala de 0 a 20)
      if (score < 0 || score > 20) {
        return res.status(400).json({ error: 'A nota deve situar-se entre 0.00 e 20.00 valores.' });
      }

      // 3. Salvar no banco de dados através do Model
      const gradeId = await GradeModel.create(student_id, class_id, finalTitle, score, weight);

      res.status(201).json({
        message: 'Nota lançada com sucesso!',
        gradeId
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao lançar nota.', details: error.message });
    }
  },

  // Obter o boletim de um aluno numa turma específica
  getStudentReportCard: async (req, res) => {
    try {
      const { studentId, classId } = req.params;
      const grades = await GradeModel.findByStudentAndClass(studentId, classId);

      // Calcular a média ponderada localmente para este aluno
      let totalPoints = 0;
      let totalWeight = 0;

      grades.forEach(g => {
        totalPoints += parseFloat(g.score) * parseFloat(g.weight);
        totalWeight += parseFloat(g.weight);
      });

      const average = totalWeight > 0 ? (totalPoints / totalWeight).toFixed(2) : '0.00';

      res.json({
        grades,
        weighted_average: average
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao obter boletim do estudante.', details: error.message });
    }
  },

  // Obter a pauta geral de uma turma (Relatório para o Diretor Pedagógico ou Professor)
  getClassGradesSheet: async (req, res) => {
    try {
      const { classId } = req.params;
      const reportSheet = await GradeModel.findClassGradesReport(classId);
      res.json(reportSheet);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao gerar pauta da turma.', details: error.message });
    }
  },

  // Listar notas individuais de uma turma
  getClassGradesList: async (req, res) => {
    try {
      const { classId } = req.params;
      const grades = await GradeModel.findByClass(classId);
      res.json(grades);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar notas da turma.', details: error.message });
    }
  },

  // Remover uma nota do sistema
  removeGrade: async (req, res) => {
    try {
      const { id } = req.params;
      const success = await GradeModel.delete(id);

      if (!success) {
        return res.status(404).json({ error: 'Registo de nota não encontrado.' });
      }

      res.json({ message: 'Nota eliminada com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao eliminar nota.', details: error.message });
    }
  }
};

module.exports = gradeController;