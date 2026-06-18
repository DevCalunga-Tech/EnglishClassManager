const FeedbackModel = require('../models/feedbackModel');

const feedbackController = {
  // Adicionar novo feedback pedagógico
  addFeedback: async (req, res) => {
    try {
      const { student_id, comments, behavior } = req.body;
      const teacher_id = req.user.id; // Extraído automaticamente do Token JWT pelo Middleware

      // 1. Validação
      if (!student_id || !comments) {
        return res.status(400).json({ error: 'Os campos student_id e comments são obrigatórios.' });
      }

      const allowedBehavior = ['excellent', 'good', 'needs_improvement'];
      if (behavior && !allowedBehavior.includes(behavior)) {
        return res.status(400).json({ error: 'Comportamento inválido. Use: excellent, good ou needs_improvement.' });
      }

      // 2. Gravar no banco através do Model
      const feedbackId = await FeedbackModel.create(student_id, teacher_id, comments, behavior);

      res.status(201).json({
        message: 'Feedback pedagógico registado com sucesso!',
        feedbackId
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao registar feedback.', details: error.message });
    }
  },

  // Obter a ficha pedagógica/histórico de um estudante
  getStudentHistory: async (req, res) => {
    try {
      const { studentId } = req.params;
      const history = await FeedbackModel.findByStudent(studentId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao obter histórico do estudante.', details: error.message });
    }
  },

  // Remover uma anotação
  removeFeedback: async (req, res) => {
    try {
      const { id } = req.params;
      const success = await FeedbackModel.delete(id);

      if (!success) {
        return res.status(404).json({ error: 'Registo de feedback não encontrado.' });
      }

      res.json({ message: 'Anotação eliminada com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao eliminar feedback.', details: error.message });
    }
  }
};

module.exports = feedbackController;