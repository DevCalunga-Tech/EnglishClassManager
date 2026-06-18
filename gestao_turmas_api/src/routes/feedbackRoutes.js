const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Rotas protegidas por JWT
router.post('/', verifyToken, feedbackController.addFeedback);
router.get('/student/:studentId', verifyToken, feedbackController.getStudentHistory);
router.delete('/:id', verifyToken, feedbackController.removeFeedback);

module.exports = router;