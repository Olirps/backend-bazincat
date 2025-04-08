// model de Viewer ordem de serviço Completa
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const OsCompleta = sequelize.define('vw_os_completa', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    cliente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    cliente_nome: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    veiculo_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    veiculo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    placa: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    observacoes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    funcionarios: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    products: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    data_criacao: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    data_aprovacao: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    data_conclusao: {
        type: DataTypes.DATE,
        allowNull: true
    },
}, {
    tableName: 'vw_os_completa', // Nome da view
    timestamps: false, // Desabilita campos createdAt e updatedAt
});

module.exports = OsCompleta;