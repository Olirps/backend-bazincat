const { Sequelize } = require('sequelize');
require('dotenv').config();

// Inicialização do Sequelize com configuração do banco de dados
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: console.log, // Ativa o logging globalmente
    pool: {
      max: 10,
      min: 0,
      acquire: 30000, // Tempo de espera para adquirir uma conexão
      idle: 10000, // Tempo ocioso antes de liberar a conexão
    },
  }
);

// Função para carregar e sincronizar os modelos
const loadModels = async () => {
  try {
    console.log(`Conectando ao banco de dados: ${process.env.DB_NAME}`);
    await sequelize.authenticate();
    console.log('Conexão bem-sucedida ao banco de dados.');

    const Banco = require('./models/Banco');

    // Importação dos modelos
    const GrupoAcesso = require('./models/GrupoAcesso');
    const UserLogin = require('./models/UserLogin');
    const ContasBancarias = require('./models/ContasBancarias');
    const Produtos = require('./models/Produtos');
    const Marcas = require('./models/Marcas');
    const UF = require('./models/Uf');
    const Municipio = require('./models/Municipio');
    const ImpostoProduto = require('./models/ImpostoProduto');
    const MovimentacoesEstoque = require('./models/MovimentacoesEstoque');
    const ItensNaoIdentificados = require('./models/ItensNaoIdentificados');
    const GrupoProduto = require('./models/GrupoProduto');
    const Subgrupoproduto = require('./models/Subgrupoproduto');
    const Vendas = require('./models/Vendas');
    const VendasItens = require('./models/VendasItens');

    // Sincronizar os modelos com o banco de dados
    await sequelize.sync({ force: false, alter: false });
    console.log('Modelos sincronizados com sucesso.');
  } catch (error) {
    console.error('Erro ao conectar ou sincronizar o banco de dados:', error);
  }
};

// Executar o carregamento dos modelos
loadModels();

module.exports = sequelize;
