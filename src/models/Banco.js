const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Banco = sequelize.define('Banco', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    codBancario: {
        type: DataTypes.STRING(5),
        allowNull: false,
        unique: true, // Garante que o código bancário seja único
        comment: 'Código bancário único para identificação do banco',


    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    sequelize,
    modelName: 'Banco',
    tableName: 'banco',
    timestamps: false // Desabilita os timestamps automáticos
});

module.exports = Banco;
