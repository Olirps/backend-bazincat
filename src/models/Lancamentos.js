const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Lancamentos = sequelize.define('Lancamentos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    venda_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'vendas', // Nome da tabela associada
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
    descricao: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tipo: {
        type: DataTypes.ENUM('credito', 'debito'),
        allowNull: false,
    },
    valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    dataLancamento: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
}, {
    tableName: 'lancamentos',
    timestamps: true,
});

Lancamentos.associate = (models) => {
    Lancamentos.belongsTo(models.Vendas, {
        foreignKey: 'venda_id',
        as: 'venda',
    });
};

module.exports = Lancamentos;
