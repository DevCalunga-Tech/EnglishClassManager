const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');


const authRoutes = require('./routes/authRoutes');
const classRoutes = require('./routes/classRoutes'); // 1. Importar as rotas de turmas
const studentRoutes = require('./routes/studentRoutes'); // 1. Importar as rotas de estudantes
const enrollmentRoutes = require('./routes/enrollmentRoutes'); // 1. Importar as rotas de matrículas
const attendanceRoutes = require('./routes/attendanceRoutes'); // 1. Importar as rotas de presenças
const gradeRoutes = require('./routes/gradeRoutes'); // 1. Importar as rotas de notas
const feedbackRoutes = require('./routes/feedbackRoutes'); // Importar Feedbacks

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../front_completo')));

// 2. CRIAR A ROTA DA DOCUMENTAÇÃO GRÁFICA DO SWAGGER
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Definição dos Endpoints do Sistema
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes); //  Vincular o prefixo /api/classes
app.use('/api/students', studentRoutes); //  Vincular o prefixo /api/students
app.use('/api/enrollments', enrollmentRoutes); //  Vincular o prefixo /api/enrollments
app.use('/api/attendance', attendanceRoutes); //  Vincular o prefixo /api/attendance
app.use('/api/grades', gradeRoutes); //  Vincular o prefixo /api/grades
app.use('/api/feedbacks', feedbackRoutes); // Vincular o prefixo /api/feedbacks


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../front_completo/index.html'));
});

module.exports = app;