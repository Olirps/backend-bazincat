// src/models/Empresa.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Empresa = sequelize.define('Empresa', {

    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome: {
        type: DataTypes.STRING(150),
        allowNull: true,
    },
    razaosocial: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    cnpj: {
        type: DataTypes.STRING(28),
        allowNull: false,
    },
    inscricao_estadual: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    telefone: {
        type: DataTypes.STRING(14),
        allowNull: false,
    },
    celular: {
        type: DataTypes.STRING(15),
        allowNull: false,
    },
    logradouro: {
        type: DataTypes.STRING(28),
        allowNull: true,
    },
    numero: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    bairro: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    uf_id: {
        type: DataTypes.STRING(2),
        allowNull: false,
        references: {
            model: 'uf', // Nome da tabela associada
            key: 'codIBGE'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    municipio_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'municipio', // Nome da tabela associada
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    cep: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    regime_tributario: {
        type: DataTypes.ENUM('1', '2', '3'),
        allowNull: false,
        comment: '1 - Simples Nacional  2 - Simples Nacional - Excesso de Sublimite  3 - Regime Normal (Lucro Presumido ou Real)'
    },
    cfop_padrao: {
        type: DataTypes.STRING(4),
        allowNull: false,
    },
    icms_aliquota: {
        type: DataTypes.DECIMAL(5,2),
        allowNull: false,
    },
    pis_aliquota: {
        type: DataTypes.DECIMAL(5,2),
        allowNull: false,
    },
    cofins_aliquota: {
        type: DataTypes.DECIMAL(5,2),
        allowNull: false,
    },
},
    {
        sequelize,
        modelName: 'Empresa',
        tableName: 'empresa',
        timestamps: false // Desabilita os timestamps automáticos
    }

)

module.exports = Empresa;
