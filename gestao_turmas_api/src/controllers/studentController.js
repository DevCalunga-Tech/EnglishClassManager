const StudentModel = require('../models/studentModel');

const studentController = {
  // Obter todos os estudantes
  getAllStudents: async (req, res) => {
    try {
      const students = await StudentModel.findAll();
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao procurar estudantes.', details: error.message });
    }
  },

  // Obter estudante por ID
  getStudentById: async (req, res) => {
    try {
      const { id } = req.params;
      const student = await StudentModel.findById(id);

      if (!student) {
        return res.status(404).json({ error: 'Estudante não encontrado.' });
      }

      res.json(student);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao obter estudante.', details: error.message });
    }
  },

  // Criar um novo estudante
  createStudent: async (req, res) => {
    try {
      const { name, email, phone, level } = req.body;

      // 1. Validação básica de campos obrigatórios
      if (!name || !email || !level) {
        return res.status(400).json({ error: 'Os campos nome, e-mail e nível são obrigatórios.' });
      }

      // 2. Validar o ENUM de níveis
      const allowedLevels = ['Beginner', 'Elementary', 'Intermediate', 'Advanced'];
      if (!allowedLevels.includes(level)) {
        return res.status(400).json({ error: 'Nível inválido. Escolha entre: Beginner, Elementary, Intermediate ou Advanced.' });
      }

      // 3. Verificar se o e-mail já está em uso por outro aluno
      const emailExists = await StudentModel.findByEmail(email);
      if (emailExists) {
        return res.status(400).json({ error: 'Este e-mail já está associado a um estudante.' });
      }

      // 4. Salvar no Banco
      const studentId = await StudentModel.create(name, email, phone, level);

      res.status(201).json({
        message: 'Estudante cadastrado com sucesso!',
        studentId
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao cadastrar estudante.', details: error.message });
    }
  },

  // Atualizar dados do estudante
  updateStudent: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, phone, level } = req.body;

      // Validar nível se for enviado
      if (level) {
        const allowedLevels = ['Beginner', 'Elementary', 'Intermediate', 'Advanced'];
        if (!allowedLevels.includes(level)) {
          return res.status(400).json({ error: 'Nível inválido.' });
        }
      }

      const success = await StudentModel.update(id, name, email, phone, level);

      if (!success) {
        return res.status(404).json({ error: 'Estudante não encontrado ou nenhuma alteração realizada.' });
      }

      res.json({ message: 'Dados do estudante atualizados com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar estudante.', details: error.message });
    }
  },

  // Eliminar um estudante
  deleteStudent: async (req, res) => {
    try {
      const { id } = req.params;
      const success = await StudentModel.delete(id);

      if (!success) {
        return res.status(404).json({ error: 'Estudante não encontrado.' });
      }

      res.json({ message: 'Estudante eliminado com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao eliminar estudante.', details: error.message });
    }
  }
};

module.exports = studentController;