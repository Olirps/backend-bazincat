const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const UnificarLancamento = sequelize.define('Banco', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    financeiro_id_new: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Código Financeiro Novo',
    },
    financeiro_id_old: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Código Financeiro Antigo',
    },
    nota_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Código Nota Fiscal',
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '0 - Inativo , 1 - Ativo',
    }
}, {
    sequelize,
    modelName: 'UnificarLancamento',
    tableName: 'unificarlancamento',
    timestamps: false // Desabilita os timestamps automáticos
});

module.exports = UnificarLancamento;
