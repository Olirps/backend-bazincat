// src/server.js
require('dotenv').config({ path: 'variaveis.env' });

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes'); // Certifique-se de que o nome do arquivo esteja correto
const authRoutes = require('./routes/auth'); // Novo arquivo de rotas de autenticação
const sequelize = require('./db'); // Importar o Sequelize

const app = express();

// Usar middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // Adicionado para lidar com JSON no corpo das requisições

// Usar rotas
app.use('/api', routes);
app.use('/api/auth', authRoutes); // Usar as rotas de autenticação

// Sincronizar o banco de dados e iniciar o servidor
const port = process.env.PORT || 3004;

const startServer = (port) => {
  app.listen(port,'0.0.0.0', () => {
    console.log(`Servidor rodando em: http://localhost:${port}`);
  }).on('error', (err) => {
    if (err.code === 'EACCES') {
      console.error(`Porta ${port} não tem permissão. Tentando usar a porta 3004...`);
      startServer(3004); // Tentar a porta 3001
    } else if (err.code === 'EADDRINUSE') {
      console.error(`Porta ${port} está em uso. Tentando usar a porta 3004...`);
      startServer(3004); // Tentar a porta 3001
    } else {
      console.error(err);
    }
  });
};

sequelize.sync()
  .then(() => {
    startServer(port);
  })
  .catch(err => {
    console.error('Erro ao sincronizar com o banco de dados:', err);
  });
