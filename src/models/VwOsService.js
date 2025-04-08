// model de Viewer ordem de serviço
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const VwOsService = sequelize.define(
  "VwOsService",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    cliente_nome: {
      type: DataTypes.STRING,
    },
    veiculo: {
      type: DataTypes.STRING,
    },
    placa: {
      type: DataTypes.STRING,
    },
    status_nome: {
      type: DataTypes.STRING,
    },
    data_criacao: {
      type: DataTypes.DATE,
    },
    data_aprovacao: {
      type: DataTypes.DATE,
    },
    data_conclusao: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "vw_os_service",
    timestamps: false, // Views não possuem createdAt e updatedAt
  }
);

module.exports = VwOsService;