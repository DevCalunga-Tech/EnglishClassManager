const UserModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
  // Registo de novos utilizadores
  register: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      // 1. Validação básica
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
      }

      // 2. Verificar se o utilizador já existe
      const userExists = await UserModel.findByEmail(email);
      if (userExists) {
        return res.status(400).json({ error: 'Este e-mail já está registado.' });
      }

      // 3. Encriptar a senha (Salt de 10)
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 4. Salvar no Banco de Dados
      const userId = await UserModel.create(name, email, hashedPassword, role);

      res.status(201).json({
        message: 'Utilizador registado com sucesso!',
        userId
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao registar utilizador.', details: error.message });
    }
  },

  // Login de utilizadores
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // 1. Validação básica
      if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
      }

      // 2. Verificar se o utilizador existe
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas.' });
      }

      // 3. Verificar se a senha está correta
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Credenciais inválidas.' });
      }

      // 4. Gerar o Token JWT (expira em 24 horas)
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );

      // 5. Retornar os dados do utilizador e o Token
      res.json({
        message: 'Login efetuado com sucesso!',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao efetuar login.', details: error.message });
    }
  },

  // Listar utilizadores (admin)
  listUsers: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso proibido. Requer privilégios de Administrador.' });
      }

      const users = await UserModel.findAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar utilizadores.', details: error.message });
    }
  },

  // Criar utilizador (admin)
  createUserByAdmin: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso proibido. Requer privilégios de Administrador.' });
      }

      const { name, email, password, role } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nome, e-mail e palavra-passe são obrigatórios.' });
      }

      const userExists = await UserModel.findByEmail(email);
      if (userExists) {
        return res.status(400).json({ error: 'Este e-mail já está registado.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const userId = await UserModel.create(name.trim(), email.trim(), hashedPassword, role || 'teacher');

      const createdUser = await UserModel.findById(userId);
      res.status(201).json({
        message: 'Utilizador criado com sucesso!',
        user: createdUser
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar utilizador.', details: error.message });
    }
  },

  // Atualizar utilizador (admin)
  updateUserByAdmin: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso proibido. Requer privilégios de Administrador.' });
      }

      const { id } = req.params;
      const { name, email, role, password } = req.body;

      const targetUser = await UserModel.findById(id);
      if (!targetUser) {
        return res.status(404).json({ error: 'Utilizador não encontrado.' });
      }

      if (Number(id) === Number(req.user.id) && role && role !== targetUser.role) {
        return res.status(400).json({ error: 'Não é permitido alterar o próprio perfil de acesso por aqui. Usa "Meu Perfil".' });
      }

      const fields = {};

      if (name !== undefined) {
        if (!name.trim()) return res.status(400).json({ error: 'O nome não pode estar vazio.' });
        fields.name = name.trim();
      }

      if (email !== undefined) {
        if (!email.trim()) return res.status(400).json({ error: 'O e-mail não pode estar vazio.' });
        const emailOwner = await UserModel.findByEmail(email.trim());
        if (emailOwner && emailOwner.id !== Number(id)) {
          return res.status(400).json({ error: 'Este e-mail já está registado por outro utilizador.' });
        }
        fields.email = email.trim();
      }

      if (role !== undefined) {
        const allowedRoles = ['admin', 'teacher'];
        if (!allowedRoles.includes(role)) {
          return res.status(400).json({ error: 'Perfil inválido. Use admin ou teacher.' });
        }
        fields.role = role;
      }

      if (password) {
        if (password.length < 6) {
          return res.status(400).json({ error: 'A palavra-passe deve ter pelo menos 6 caracteres.' });
        }
        const salt = await bcrypt.genSalt(10);
        fields.password = await bcrypt.hash(password, salt);
      }

      const updated = await UserModel.updateById(id, fields);
      if (!updated) {
        return res.status(400).json({ error: 'Nenhuma alteração foi aplicada.' });
      }

      const freshUser = await UserModel.findById(id);
      res.json({ message: 'Utilizador atualizado com sucesso!', user: freshUser });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar utilizador.', details: error.message });
    }
  },

  // Eliminar utilizador (admin)
  deleteUserByAdmin: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso proibido. Requer privilégios de Administrador.' });
      }

      const { id } = req.params;

      if (Number(id) === Number(req.user.id)) {
        return res.status(400).json({ error: 'Não podes eliminar a tua própria conta aqui.' });
      }

      const deleted = await UserModel.deleteById(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Utilizador não encontrado.' });
      }

      res.json({ message: 'Utilizador eliminado com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao eliminar utilizador.', details: error.message });
    }
  },

  // Obter perfil do utilizador autenticado
  getMe: async (req, res) => {
    try {
      const user = await UserModel.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ error: 'Utilizador não encontrado.' });
      }

      res.json({ user });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao obter perfil.', details: error.message });
    }
  },

  // Atualizar perfil do utilizador autenticado
  updateMe: async (req, res) => {
    try {
      const { name, email, current_password, new_password } = req.body;
      const userId = req.user.id;

      const authenticatedUser = await UserModel.findById(userId);

      if (!authenticatedUser) {
        return res.status(404).json({ error: 'Utilizador não encontrado.' });
      }

      const fields = {};

      if (name !== undefined) {
        if (!name.trim()) {
          return res.status(400).json({ error: 'O nome não pode estar vazio.' });
        }
        fields.name = name.trim();
      }

      if (email !== undefined) {
        if (!email.trim()) {
          return res.status(400).json({ error: 'O e-mail não pode estar vazio.' });
        }

        const emailOwner = await UserModel.findByEmail(email.trim());
        if (emailOwner && emailOwner.id !== userId) {
          return res.status(400).json({ error: 'Este e-mail já está registado por outro utilizador.' });
        }

        fields.email = email.trim();
      }

      if (new_password) {
        if (!current_password) {
          return res.status(400).json({ error: 'A palavra-passe atual é obrigatória para alterar a senha.' });
        }

        const fullUser = await UserModel.findByEmail(authenticatedUser.email);
        const isMatch = await bcrypt.compare(current_password, fullUser.password);
        if (!isMatch) {
          return res.status(400).json({ error: 'A palavra-passe atual está incorreta.' });
        }

        if (new_password.length < 6) {
          return res.status(400).json({ error: 'A nova palavra-passe deve ter pelo menos 6 caracteres.' });
        }

        const salt = await bcrypt.genSalt(10);
        fields.password = await bcrypt.hash(new_password, salt);
      }

      const updated = await UserModel.updateById(userId, fields);
      if (!updated) {
        return res.status(400).json({ error: 'Nenhuma alteração foi aplicada.' });
      }

      const freshUser = await UserModel.findById(userId);
      res.json({
        message: 'Perfil atualizado com sucesso!',
        user: freshUser
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar perfil.', details: error.message });
    }
  }
};

module.exports = authController;