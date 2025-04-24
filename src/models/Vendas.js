const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const VendasStatus = require('../models/VendasStatus');
const Funcionarios = require('../models/Funcionarios');

const Vendas = sequelize.define('Vendas', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    cliente: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    cliente_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'clientes', // Nome da tabela associada
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    desconto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    totalQuantity: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: true,
    },
    dataVenda: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: VendasStatus, // Referência à tabela status_transacao
            key: 'id',
        },
    },
    motivo_cancelamento: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    dataCancelamento: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    funcionario_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Funcionarios, // Referência à tabela status_transacao
            key: 'id',
        },
    },

}, {
    tableName: 'vendas',
    timestamps: true,
});

Vendas.associate = (models) => {
    Vendas.hasMany(models.VendasItens, {
        foreignKey: 'venda_id',
        as: 'vendaitens',
    });

};
Vendas.belongsTo(VendasStatus, { foreignKey: 'status_id' });


module.exports = Vendas;

