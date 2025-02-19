// src/models/Pagamentos.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const NotaFiscal = require('../models/NotaFiscal');

const Pagamentos = sequelize.define('Pagamentos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nota_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'nota_fiscal', // Nome da tabela associada
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    tPag: {
        type: DataTypes.STRING(5),
        allowNull: false, // Tipo de pagamento (01 - Dinheiro, 03 - Cartão de Crédito, etc.)
    },
    vPag: {
        type: DataTypes.FLOAT(10, 2),
        allowNull: true, // Valor pago
    },
    indPag: {
        type: DataTypes.STRING(3),
        allowNull: true, // Indicador de pagamento (0 - À vista, 1 - A prazo, 2 - Outros)
    },
    CNPJ: {
        type: DataTypes.STRING(25),
        allowNull: true, // CNPJ do recebedor (se for pessoa jurídica)
    },
    CNPJPag: {
        type: DataTypes.STRING(25),
        allowNull: true, // CNPJ do recebedor (se for pessoa jurídica)
    },
    CPF: {
        type: DataTypes.STRING(18),
        allowNull: true, // CPF do recebedor (se for pessoa física)
    },
    tBand: {
        type: DataTypes.STRING(50),
        allowNull: true, // Bandeira do cartão (Visa, MasterCard, etc.)
    },
    cAutorizacao: {
        type: DataTypes.STRING(100),
        allowNull: true, // Código de autorização da transação (para pagamentos com cartão)
    },
    xNomeCred: {
        type: DataTypes.STRING(100),
        allowNull: true, // Nome do credor (responsável pelo pagamento, quando cartão)
    },
    vTroco: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true, // Valor do troco (caso haja)
    }
}, {
    tableName: 'pagamentosnf', // Nome da tabela no banco de dados
    timestamps: true, // Se desejar adicionar createdAt e updatedAt automaticamente
});

module.exports = Pagamentos;
