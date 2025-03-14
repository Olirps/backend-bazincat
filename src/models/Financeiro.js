const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Financeiro = sequelize.define('Financeiro', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    credor_nome: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    descricao: {
        type: DataTypes.STRING(255),
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
    data_vencimento: {
        type: DataTypes.DATE,
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
    tipo_parcelamento: {
        type: DataTypes.ENUM('mensal', 'anual'),
        allowNull: true,
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
    },
    motivo_cancelamento: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Financeiro',
    tableName: 'financeiro',
    timestamps: false // Desabilita os timestamps automáticos
});

module.exports = Financeiro;
