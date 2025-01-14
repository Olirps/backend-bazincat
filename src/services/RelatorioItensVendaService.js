const { Op } = require('sequelize');
const VendasItens = require('../models/VendasItens');
const Vendas = require('../models/Vendas');
const Produtos = require('../models/Produtos');

class RelatorioItensVendaService {
    static async getItensVendidosPorPeriodo(periodo) {
        try {
            // Filtra primeiro as vendas dentro do período
            const { dataInicio, dataFim } = periodo;
            const dataInicioFormatada = dataInicio.split('/').reverse().join('-');
            const dataFimFormatada = dataFim.split('/').reverse().join('-');
            const vendas = await Vendas.findAll({
                where: {
                    dataVenda: {
                        [Op.between]: [dataInicioFormatada, dataFimFormatada]
                    }
                },
                attributes: ['id'] // Pega apenas o id das vendas no período
            });

            // Obtém os itens vendidos através das vendas filtradas
            const itensVendidos = await VendasItens.findAll({
                where: {
                    venda_id: {
                        [Op.in]: vendas.map(venda => venda.id) // Relaciona os itens às vendas do período
                    }
                }
            });

            // Enriquecer os itens com o nome do produto (xProd)
            for (let item of itensVendidos) {
                const produto = await Produtos.findByPk(item.produto_id);
                if (produto) {
                    item.dataValues.xProd = produto.xProd; // Adiciona o campo xProd ao item
                    item.dataValues.vlrUnitario = produto.vlrVenda; // Adiciona o campo xProd ao item
                }
            }

            return itensVendidos;
        } catch (error) {
            console.error('Erro ao buscar itens vendidos por período:', error);
            throw error;
        }
    }
}

module.exports = RelatorioItensVendaService;
