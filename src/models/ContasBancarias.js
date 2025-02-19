const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const ContasBancarias = sequelize.define('ContasBancarias', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    banco_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'banco',
            key: 'id',
        },
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
    timestamps: false // Desabilita os timestamps automáticos
});

module.exports = ContasBancarias;
