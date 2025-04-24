const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const VendasStatus = sequelize.define('VendasStatus', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    descricao: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,  // Garantir que a descrição seja única
    }
}, {
    tableName: 'vendas-status',
    timestamps: false,
});

module.exports = VendasStatus;
