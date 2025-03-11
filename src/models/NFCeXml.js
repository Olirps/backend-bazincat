const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const NFCeXml = sequelize.define("NFCeXml", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    venda_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'vendas', // Nome da tabela associada
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    chaveAcesso: {
        type: DataTypes.STRING(44),
        allowNull: false,
        unique: true,
    },
    nNF: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    cNF: {
        type: DataTypes.STRING(8),
        allowNull: true
    },
    xml: {
        type: DataTypes.BLOB, // Troque para BLOB se necessário
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('AUTORIZADA', 'CANCELADA', 'REJEITADA', 'ASSINADA', 'ANDAMENTO'),
        allowNull: false,
        defaultValue: "AUTORIZADA",
    },
}, {
    sequelize,
    modelName: 'NFCeXml',
    tableName: 'nfcexml',
    timestamps: true // Desabilita os timestamps automáticos
});

module.exports = NFCeXml;
