// model de ordem de serviço
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const OSService = sequelize.define('os_service', { // Nome ajustado
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    cliente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'clientes',
            key: 'id',
        },
    },
    veiculo_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'veiculos',
            key: 'id',
        },
    },
    status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'os_status',
            key: 'id',
        },
    },
    data_criacao: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    data_aprovacao: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    data_conclusao: {
        type: DataTypes.DATE,
        allowNull: true
    },
    observacoes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    valor_total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    desconto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
}, {
    sequelize,
    modelName: 'os_service',
    tableName: 'os_service', // Nome corrigido
    timestamps: false
});

module.exports = OSService;
