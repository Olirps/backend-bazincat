const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const OSProdutosServicos = sequelize.define('OSProdutosServicos', {
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
    produto_servico_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'produtos',
            key: 'id',
        },
    },
    quantidade: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: false,
        defaultValue: 0.00,
    },
    vlrVenda: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
    valorTotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
    data_aprovacao: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'os_status',
            key: 'id',
        },
    },
    removido: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    data_removido: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    modelName: 'OSProdutosServicos',
    tableName: 'os_produtos_servicos',
    timestamps: false,
});

module.exports = OSProdutosServicos;
