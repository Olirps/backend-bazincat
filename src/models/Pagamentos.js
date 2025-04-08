const { DataTypes } = require('sequelize');
const sequelize = require('../db');

  const Pagamentos = sequelize.define('Pagamentos', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
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
    vlrPago: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    formapgto_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'formas-pagamento', // Nome da tabela associada
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    formaPagamento: {
        type: DataTypes.ENUM('dinheiro', 'pix', 'cartaoDebito', 'cartaoCredito', 'pedido'),
        allowNull: true,
    },
  }, {
    tableName: 'pagamentos',
    timestamps: true,
  });

  Pagamentos.associate = (models) => {
    Pagamentos.belongsTo(models.Vendas, {
      foreignKey: 'venda_id',
      as: 'vendas',
    });
  };

  module.exports = Pagamentos;
