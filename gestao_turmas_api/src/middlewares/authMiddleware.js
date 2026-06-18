const jwt = require('jsonwebtoken');

const authMiddleware = {
  // 1. Verificar se o utilizador está autenticado via Token JWT
  verifyToken: (req, res, next) => {
    // O token geralmente vem no formato: "Bearer <TOKEN>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    try {
      // Verifica e descodifica o token usando a chave secreta do .env
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Anexa os dados do utilizador descodificados (id e role) à requisição (req.user)
      req.user = decoded;
      
      // Passa para o próximo bloco de código (o Controller ou outro Middleware)
      next();
    } catch (error) {
      return res.status(403).json({ error: 'Token inválido ou expirado.' });
    }
  },

  // 2. Verificar se o utilizador tem permissões de Administrador
  isAdmin: (req, res, next) => {
    // Este middleware roda SEMPRE depois do verifyToken, logo o req.user já existe
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso proibido. Requer privilégios de Administrador.' });
    }
    next();
  }
};

module.exports = authMiddleware;