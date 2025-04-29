const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Banco = require('../models/Banco');

const ContasBancarias = sequelize.define('ContasBancarias', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    banco_id: {
        type: DataTypes.INTEGER,
        references: {
          model: Banco, // <- aqui precisa ser o model, não uma string
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    agencia: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    conta: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    tipo_conta: {
        type: DataTypes.ENUM('corrente', 'poupanca'),
        allowNull: false,
    },
    documento: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    sequelize,
    modelName: 'ContasBancarias',
    tableName: 'contasbancarias',
    timestamps: false
});

// Associações
ContasBancarias.belongsTo(Banco, {
    foreignKey: 'banco_id',
    as: 'Banco'
});

module.exports = ContasBancarias;
