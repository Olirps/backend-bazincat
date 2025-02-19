// models/Permissoes.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Ajuste o caminho conforme necessário
const GrupoAcesso = require('./GrupoAcesso'); // Importar o modelo GrupoAcesso

const Permissoes = sequelize.define('Permissoes', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    pagename: {
        type: DataTypes.STRING,
        allowNull: false
    },
    view: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    viewcadastro: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    edit: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    delete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    insert: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    grupoAcessoId: {
        type: DataTypes.INTEGER,
        references: {
            model: GrupoAcesso, // Nome do modelo referenciado
            key: 'id'
        }
    }
}, {
    tableName: 'permissoes', // Nome da tabela no banco de dados
    timestamps: false // Se você não deseja incluir colunas de timestamps (createdAt e updatedAt)
});

// Definindo o relacionamento com o GrupoAcesso
Permissoes.belongsTo(GrupoAcesso, { foreignKey: 'grupoAcessoId' });

module.exports = Permissoes;
