const { DataTypes } = require('sequelize');
const sequelize = require('../db');





const VinculoProdVeiculo = sequelize.define('VinculoProdVeiculo',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    produto_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'produtos',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    veiculo_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'veiculos',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    nota_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'nota_fiscal',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    movimentacaoestoque_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'movimentacoes_estoque',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    quantidade: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    dataVinculo: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pendente', 'fechado', 'reaberto'),
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'VinculoProdVeiculo',
    tableName: 'vinculoprodveiculo',
    timestamps: true
});

module.exports = VinculoProdVeiculo;