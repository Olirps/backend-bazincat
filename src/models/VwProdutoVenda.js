// models/VwProdutoVenda.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const VwProdutoVenda = sequelize.define(
  "VwProdutoVenda",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    cod_interno: {
      type: DataTypes.STRING,
    },
    cEAN: {
      type: DataTypes.STRING(14),
      field: 'cEAN', // Mapeia para o campo cEAN na view
    },
    xProd: {
      type: DataTypes.STRING(100),
      field: 'xProd', // Mapeia para o campo xProd na view
    },
    vcProd: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'vlrVenda',
    },
    vlrVenda: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'vlrVenda',
    },
    vlrVendaAtacado: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'vlrVendaAtacado',
    },
    uCom: {
      type: DataTypes.STRING(10),
      field: 'uCom',
    },
    qCom: {
      type: DataTypes.DECIMAL(10, 3),
      field: 'qCom',
    },
    ncm: {
      type: DataTypes.STRING(8),
    },
    status: {
      type: DataTypes.INTEGER,
    }
  },
  {
    tableName: "v_produtos_venda", // Nome da view no banco
    timestamps: false, // Views não possuem timestamps
    comment: 'View para otimizar consultas de produtos no processo de venda',
    // Opções adicionais para melhor performance
    defaultScope: {
      attributes: {
        exclude: [], // Inclui todos os campos por padrão
      },
    },
  }
);

module.exports = VwProdutoVenda;