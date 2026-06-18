const app = require('./src/app.js');
// Importa o db.js apenas para disparar o teste de conexão logo no arranque do servidor
require('./src/config/db.js'); 

require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(` Servidor a rodar com sucesso na porta ${PORT}`);
});