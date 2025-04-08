// model de workflow ordem de serviço
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const OSWorkflow = sequelize.define("OSWorkflow", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  os_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "os_service", 
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  status_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: "os_status", 
        key: "id",
      },
  },
  status_nome: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  data_mudanca: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  login: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
}, {
  tableName: "os_workflow",
  timestamps: false, // Não precisa de createdAt e updatedAt
});

module.exports = OSWorkflow;
