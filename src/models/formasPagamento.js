const { DataTypes } = require('sequelize');
const sequelize = require('../db');



const FormasPagamento = sequelize.define('FormasPagamento', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nome: {
        type: DataTypes.STRING(25),
        allowNull: false,
        unique: true, // Garante que o nome da forma de pagamento seja único
    }
}, {
    sequelize,
    modelName: 'formasPagamento',
    tableName: 'formas-pagamento',
    timestamps: false, // Desabilita os timestamps automáticos
}
);

module.exports = FormasPagamento;
