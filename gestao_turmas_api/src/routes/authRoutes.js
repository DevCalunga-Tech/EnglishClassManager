const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Rota: POST /api/auth/register
router.post('/register', authController.register);

// Rota: POST /api/auth/login
router.post('/login', authController.login);

// Rota: GET /api/auth/me
router.get('/me', verifyToken, authController.getMe);

// Rota: PUT /api/auth/me
router.put('/me', verifyToken, authController.updateMe);

// Administração de utilizadores
router.get('/users', verifyToken, authController.listUsers);
router.post('/users', verifyToken, authController.createUserByAdmin);
router.put('/users/:id', verifyToken, authController.updateUserByAdmin);
router.delete('/users/:id', verifyToken, authController.deleteUserByAdmin);

module.exports = router;