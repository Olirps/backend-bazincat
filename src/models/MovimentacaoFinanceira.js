const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const MovimentacaoFinanceira = sequelize.define('MovimentacaoFinanceira', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    parcela: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    descricao: {
        type: DataTypes.STRING(150),
        allowNull: true,
    },
    financeiro_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'financeiro',
            key: 'id',
        },
        allowNull: false,
    },
    data_pagamento: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    boleto: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    vencimento: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    valor_parcela: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    valor_pago: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    conta_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'contasbancarias',
            key: 'id',
        },
        allowNull: true,
    },
    metodo_pagamento: {
        type: DataTypes.ENUM('transferencia', 'boleto', 'credito', 'debito','cheque', 'dinheiro', 'PIX', 'DA', 'TRFCC', 'TED'),
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('pendente', 'liquidado', 'cancelado'),
        defaultValue: 'pendente',
        allowNull: false,
    },
    motivo_cancelamento: {
        type: DataTypes.STRING(155),
        allowNull: true,
    },
    data_cancelamento: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    data_efetiva_pg: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    
}, {
    sequelize,
    modelName: 'MovimentacaoFinanceira',
    tableName: 'movimentacaofinanceira',
    timestamps: false // Desabilita os timestamps automáticos
});

module.exports = MovimentacaoFinanceira;
