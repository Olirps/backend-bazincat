// models/VwFinanceiroDebito.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const VwFinanceiroDebito = sequelize.define(
  'VwFinanceiroDebito',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    credor_nome: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cpfCnpj: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    descricao: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    nota_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    data_lancamento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tipo_lancamento: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tipo_parcelamento: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pagamento: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    data_cancelamento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'vw_financeiro_debito', // Nome da view no banco de dados
    timestamps: false, // Desabilita os campos `createdAt` e `updatedAt`
  }
);

module.exports = VwFinanceiroDebito;