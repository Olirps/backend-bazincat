const { DataTypes } = require('sequelize');
const sequelize = require('../db');


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
    formaPagamento: {
        type: DataTypes.ENUM('dinheiro', 'pix', 'cartaoDebito', 'cartaoCredito', 'pedido'),
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
    motivo_cancelamento: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    dataCancelamento: {
        type: DataTypes.STRING,
        allowNull: true,
    }
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

module.exports = Vendas;

