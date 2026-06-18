const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Todas as rotas de chamada exigem login com JWT
router.post('/', verifyToken, attendanceController.takeAttendance);
router.get('/class/:classId', verifyToken, attendanceController.getClassAttendanceByDate);
router.get('/report/student/:studentId/class/:classId', verifyToken, attendanceController.getStudentAttendanceReport);

module.exports = router;