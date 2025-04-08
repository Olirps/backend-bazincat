// model de status de ordem de serviço
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const OSStatus = sequelize.define('os_status', { // Nome ajustado
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    descricao: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    ativo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    ordem: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    }
}, {
    sequelize,
    modelName: 'os_status',
    tableName: 'os_status', // Nome corrigido
    timestamps: false
});

module.exports = OSStatus;
