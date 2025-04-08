const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const OSFuncionarios = sequelize.define('OSFuncionarios', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    os_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'os_service',
            key: 'id',
        },
    },
    funcionario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'funcionarios',
            key: 'id',
        },
    },
    servico_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'os_produtos',
            key: 'id',
        },
    },
    percentual: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.00,
    },
}, {
    sequelize,
    modelName: 'OSFuncionarios',
    tableName: 'os_funcionarios',
    timestamps: false,
});

module.exports = OSFuncionarios;
