const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Financeiro = sequelize.define('Financeiro', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    descricao: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    valor: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    fornecedor_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'fornecedores',
            key: 'id',
        },
    },
    cliente_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'clientes',
            key: 'id',
        },
    },
    funcionario_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'funcionarios',
            key: 'id',
        },
    },
    nota_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'nota_fiscal',
            key: 'id',
        },
    },
    data_vencimento: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: true
    },
    data_lancamento: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    tipo_lancamento: {
        type: DataTypes.ENUM('automatico', 'manual'),
        allowNull: false,
    },
    pagamento: {
        type: DataTypes.ENUM('cotaunica', 'recorrente', 'parcelada'),
        allowNull: true,
    },
    tipo: {
        type: DataTypes.ENUM('credito', 'debito'),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('aberta', 'andamento', 'liquidado', 'cancelada'),
        allowNull: true
    },
    data_cancelamento: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    sequelize,
    modelName: 'Financeiro',
    tableName: 'financeiro',
    timestamps: false // Desabilita os timestamps automáticos
});

module.exports = Financeiro;
