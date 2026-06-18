const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Todas as rotas de estudantes exigem que o utilizador esteja autenticado via JWT
router.get('/', verifyToken, studentController.getAllStudents);
router.get('/:id', verifyToken, studentController.getStudentById);
router.post('/', verifyToken, studentController.createStudent);
router.put('/:id', verifyToken, studentController.updateStudent);
router.delete('/:id', verifyToken, studentController.deleteStudent);

module.exports = router;