// swagger.js
const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'English Class Management API',
    description: 'Documentação automática do sistema de gestão de turmas, alunos, chamadas e notas.',
    version: '1.0.0',
  },
  host: 'localhost:3000',
  basePath: '/api',
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Insira o token JWT no formato: Bearer <seu_token>'
    }
  },
  security: [{ bearerAuth: [] }]
};
// CORREÇÃO: Salvar o JSON gerado dentro da pasta 'src' para o app.js encontrá-lo
const outputFile = './src/swagger-output.json'; 

// CORREÇÃO: Apontar corretamente para o app.js dentro da pasta 'src'
const endpointsFiles = ['./src/app.js']; 

swaggerAutogen(outputFile, endpointsFiles, doc)
  .then(() => {
    console.log(' Documentação do Swagger gerada com sucesso dentro da pasta src!');
  })
  .catch(err => {
    console.error('Erro crítico ao gerar o Swagger:', err);
  });