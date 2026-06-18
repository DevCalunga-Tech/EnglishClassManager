const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Todas as rotas deste módulo necessitam de autenticação
router.post('/', verifyToken, enrollmentController.enrollStudent);
router.get('/class/:classId', verifyToken, enrollmentController.getClassStudents);
router.get('/student/:studentId', verifyToken, enrollmentController.getStudentClasses);
router.delete('/:id', verifyToken, enrollmentController.unenrollStudent);

module.exports = router;