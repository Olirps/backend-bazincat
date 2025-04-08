// src/models/Produtos.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');


const Produtos = sequelize.define('Produtos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    tipo: {
        type: DataTypes.ENUM('produto', 'servico'),
        allowNull: true,
    },
    cProd: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    cod_interno: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    cEAN: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    xProd: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    NCM: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    CFOP: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    uCom: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    qCom: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    vUnCom: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    vProd: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    validade: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    qtdMinima: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    marca: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    EXTIPI: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    CEST: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    indEscala: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    cEANTrib: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    uTrib: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    qTrib: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    vUnTrib: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    vDesc: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    indTot: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    cProdANP: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    descANP: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    UFCons: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    nBico: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    nTanque: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    vEncIni: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    vEncFin: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    pBio: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
    },
    vlrVenda: {
        type: DataTypes.DECIMAL(15,2),
        allowNull: true,
    },
    vlrVendaAtacado: {
        type: DataTypes.DECIMAL(15,2),
        allowNull: true,
    },
    margemSobreVlrCusto: {
        type: DataTypes.DECIMAL(15,4),
        allowNull: true,
    },
    margemSobreVlrCustoAtacado: {
        type: DataTypes.DECIMAL(15,4),
        allowNull: true,
    },
    pct_servico: {
        type: DataTypes.DECIMAL(10,4),
        allowNull: true,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
}, {
    sequelize,
    modelName: 'Produtos',
    tableName: 'produtos',
    timestamps: true
});

module.exports = Produtos;
