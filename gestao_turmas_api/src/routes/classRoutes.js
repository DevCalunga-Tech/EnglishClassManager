const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// Rotas protegidas por login (Professores e Admins podem ver)
router.get('/', verifyToken, classController.getAllClasses);
router.get('/:id', verifyToken, classController.getClassById);

// Rotas restritas (Apenas Administradores podem alterar a estrutura das turmas)
router.post('/', verifyToken, isAdmin, classController.createClass);
router.put('/:id', verifyToken, isAdmin, classController.updateClass);
router.delete('/:id', verifyToken, isAdmin, classController.deleteClass);

module.exports = router;