const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Todos os endpoints deste módulo requerem validação do token JWT
router.post('/', verifyToken, gradeController.addGrade);
router.get('/student/:studentId/class/:classId', verifyToken, gradeController.getStudentReportCard);
router.get('/class/:classId/list', verifyToken, gradeController.getClassGradesList);
router.get('/class/:classId/report', verifyToken, gradeController.getClassGradesSheet);
router.delete('/:id', verifyToken, gradeController.removeGrade);

module.exports = router;