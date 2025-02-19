const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const NotaFiscal = require('../models/NotaFiscal');

const ContasPagar = sequelize.define('ContasPagar', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nota_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Agora pode ser nulo para despesas sem NF
        references: {
            model: NotaFiscal,
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    descricao: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    tipo_despesa: {
        type: DataTypes.ENUM('FORNECEDOR', 'FUNCIONARIO', 'OUTROS'),
        allowNull: false
    },
    fornecedor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'fornecedores', // Tabela de fornecedores
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    funcionario_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'funcionarios', // Tabela de funcionários
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    vParcela: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    dtVencimento: {
        type: DataTypes.DATE,
        allowNull: true
    },
    dtPagamento: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('PENDENTE', 'PAGO', 'ATRASADO'),
        defaultValue: 'PENDENTE'
    }
}, {
    tableName: 'contas_pagar',
    timestamps: true
});

module.exports = ContasPagar;
