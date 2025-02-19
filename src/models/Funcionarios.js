const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db'); // Ajuste o caminho conforme necessário
const Cliente = require('./Clientes');

class Funcionarios extends Model {}

Funcionarios.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    // Campos específicos de Funcionario
    cliente_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'clientes', // Nome da tabela associada
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    cargo: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    salario: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    dataContratacao: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    tipoFuncionario: {
        type: DataTypes.ENUM,
        values: ['administrativo', 'servico', 'gestao'],
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'Funcionarios',
    tableName: 'funcionarios',

});

// Relacionamento com Cliente
Funcionarios.belongsTo(Cliente, { foreignKey: 'clienteId' });

module.exports = Funcionarios;
