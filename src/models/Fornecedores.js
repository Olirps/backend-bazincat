// src/models/Fornecedores.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Fornecedores = sequelize.define('Fornecedores', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  nomeFantasia: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  fornecedor_contato: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  inscricaoestadual: {
    type: DataTypes.STRING(25),
    allowNull: true
  },
  cpfCnpj: {
    type: DataTypes.STRING(14),
    allowNull: false,
    unique: true,
  },
  fone: {
    type: DataTypes.STRING(11),
    allowNull: true
  },
  celular: {
    type: DataTypes.STRING(11),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  logradouro: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  numero: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  bairro: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  municipio: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  uf: {
    type: DataTypes.STRING(2),
    allowNull: false
  },
  cep: {
    type: DataTypes.STRING(8),
    allowNull: false
  },
  tipo_fornecedor: {
    type: DataTypes.ENUM('peça', 'maquinario', 'suplemento', 'transporte', 'servico'),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('S', 'N'),
    allowNull: true
  }
  
}, {
  tableName: 'fornecedores',
  timestamps: true,
});


module.exports = Fornecedores;
