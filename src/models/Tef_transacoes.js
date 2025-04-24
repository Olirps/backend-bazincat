const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const TipoTransacao = require('../models/TipoTransacao');
const StatusTransacao = require('../models/StatusTransacao');

const TefTransacao = sequelize.define('TefTransacao', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    pagamento_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'pagamentos', // Tabela de pagamentos
            key: 'id',
        },
    },
    venda_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'vendas', // Tabela de vendas
            key: 'id',
        },
    },
    transacao_id: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    nsu_sitef: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    data_hora: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    valor: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    bandeira_cartao: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    tipo_transacao_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: TipoTransacao, // Referência à tabela tipo_transacao
            key: 'id',
        },
    },
    status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: StatusTransacao, // Referência à tabela status_transacao
            key: 'id',
        },
    },
    mensagem_retorno: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    codigo_autorizacao: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    nsu_host: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    codigo_resposta: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    comprovante_cliente: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    comprovante_loja: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    criado_em: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    atualizado_em: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
    },
}, {
    tableName: 'tef_transacoes',
    timestamps: false, // Controlado manualmente com `criado_em` e `atualizado_em`
});

// Definindo relações
TefTransacao.belongsTo(TipoTransacao, { foreignKey: 'tipo_transacao_id' });
TefTransacao.belongsTo(StatusTransacao, { foreignKey: 'status_id' });

module.exports = TefTransacao;
