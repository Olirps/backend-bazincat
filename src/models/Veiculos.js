// src/models/Veiculos.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Marcas = require('../models/Marcas');
const TipoVeiculo = require('../models/TipoVeiculo');

const Veiculos = sequelize.define('Veiculos', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  modelo: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  placa: {
    type: DataTypes.STRING(10),
    allowNull: true,
    unique: true,
  },
  quilometragem: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  marcaId: {
    type: DataTypes.INTEGER,
    references: {
      model: Marcas,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  tipoveiculoId: {
    type: DataTypes.INTEGER,
    references: {
      model: TipoVeiculo,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
}, {
  tableName: 'veiculos',
  timestamps: true,
});

Veiculos.belongsTo(Marcas, { foreignKey: 'marcaId', as: 'marcas' });
Veiculos.belongsTo(TipoVeiculo, { foreignKey: 'tipoveiculoId', as: 'tipoveiculo' });

module.exports = Veiculos;
