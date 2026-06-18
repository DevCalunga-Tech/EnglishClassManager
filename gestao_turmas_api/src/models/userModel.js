const db = require('../config/db');

const UserModel = {
  // Encontrar utilizador por Email (usado no login e validação)
  findByEmail: async (email) => {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0]; // Retorna o utilizador encontrado ou undefined
  },

  // Encontrar utilizador por ID
  findById: async (id) => {
    const [rows] = await db.execute('SELECT id, name, email, role FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  // Listar todos os utilizadores
  findAll: async () => {
    const [rows] = await db.execute('SELECT id, name, email, role FROM users ORDER BY name ASC');
    return rows;
  },

  // Criar um novo utilizador (Professor ou Admin)
  create: async (name, email, password, role) => {
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role || 'teacher']
    );
    return result.insertId; // Retorna o ID do utilizador criado
  },

  // Atualizar os dados do perfil
  updateById: async (id, fields) => {
    const updates = [];
    const values = [];

    if (fields.name !== undefined) {
      updates.push('name = ?');
      values.push(fields.name);
    }

    if (fields.email !== undefined) {
      updates.push('email = ?');
      values.push(fields.email);
    }

    if (fields.password !== undefined) {
      updates.push('password = ?');
      values.push(fields.password);
    }

    if (updates.length === 0) {
      return false;
    }

    values.push(id);
    const [result] = await db.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  },

  // Eliminar utilizador
  deleteById: async (id) => {
    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = UserModel;