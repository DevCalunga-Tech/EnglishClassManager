const ClassModel = require('../models/classModel');

const classController = {
  // Obter todas as turmas
  getAllClasses: async (req, res) => {
    try {
      const classes = await ClassModel.findAll();
      res.json(classes);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao procurar turmas.', details: error.message });
    }
  },

  // Obter uma turma por ID
  getClassById: async (req, res) => {
    try {
      const { id } = req.params;
      const targetClass = await ClassModel.findById(id);
      
      if (!targetClass) {
        return res.status(404).json({ error: 'Turma não encontrada.' });
      }
      
      res.json(targetClass);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao obter a turma.', details: error.message });
    }
  },

  // Criar uma nova turma
  createClass: async (req, res) => {
    try {
      const { name, schedule, level, teacher_id } = req.body;

      // 1. Validação de campos obrigatórios
      if (!name || !schedule || !level) {
        return res.status(400).json({ error: 'Os campos nome, horário e nível são obrigatórios.' });
      }

      // 2. Validar se o nível coincide com o ENUM do banco
      const allowedLevels = ['Beginner', 'Elementary', 'Intermediate', 'Advanced'];
      if (!allowedLevels.includes(level)) {
        return res.status(400).json({ error: 'Nível inválido. Escolha entre: Beginner, Elementary, Intermediate ou Advanced.' });
      }

      // 3. Chamar o Model para inserir no MySQL
      const classId = await ClassModel.create(name, schedule, level, teacher_id || null);

      res.status(201).json({
        message: 'Turma criada com sucesso!',
        classId
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar turma.', details: error.message });
    }
  },

  // Atualizar uma turma existente
  updateClass: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, schedule, level, teacher_id } = req.body;

      const success = await ClassModel.update(id, name, schedule, level, teacher_id || null);
      
      if (!success) {
        return res.status(404).json({ error: 'Turma não encontrada ou nenhuma alteração foi feita.' });
      }

      res.json({ message: 'Turma atualizada com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar turma.', details: error.message });
    }
  },

  // Eliminar uma turma
  deleteClass: async (req, res) => {
    try {
      const { id } = req.params;
      const success = await ClassModel.delete(id);

      if (!success) {
        return res.status(404).json({ error: 'Turma não encontrada.' });
      }

      res.json({ message: 'Turma eliminada com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao eliminar turma.', details: error.message });
    }
  }
};

module.exports = classController;