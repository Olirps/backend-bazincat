const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const TipoTransacao = sequelize.define('TipoTransacao', {
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
    tableName: 'tipo_transacao',
    timestamps: false,
});

module.exports = TipoTransacao;
