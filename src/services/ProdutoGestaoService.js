const Produtos = require('../models/Produtos');
const Vendas = require("../models/Vendas");
const VendasItens = require('../models/VendasItens');
const MovimentacoesEstoque = require('../models/MovimentacoesEstoque');
const Pagamentos = require('./PagamentosService');
const Lancamentos = require('./LancamentosService');


class ProdutoGestao {
    static async consultaProdutosVendidos() {
        // Busca todas as vendas
        const vendas = await Vendas.findAll(
            {
                where: {
                    status:0
                },
                order: [['id', 'DESC']]
            }
        );

        // Array para armazenar o resultado final
        const vendasComProdutos = [];

        for (const venda of vendas) {
            // Busca os produtos associados à venda atual
            const produtos = await VendasItens.findAll({
                where: {
                    venda_id: venda.id
                }
            });

            // Para cada produto, busca o campo xProd na tabela de produtos
            const produtosComXProd = await Promise.all(
                produtos.map(async (produto) => {
                    // Busca o produto na tabela de produtos
                    const produtoInfo = await Produtos.findOne({
                        where: {
                            id: produto.produto_id
                        },
                        attributes: ['xProd'] // Busca apenas o campo xProd
                    });

                    // Retorna o produto com o campo xProd adicionado
                    return {
                        ...produto.get({ plain: true }), // Converte o objeto Sequelize para um objeto simples
                        xProd: produtoInfo ? produtoInfo.xProd : null // Adiciona o campo xProd
                    };
                })
            );

            // Adiciona a venda e seus produtos ao array de resultados
            vendasComProdutos.push({
                venda: venda,
                produtos: produtosComXProd
            });
        }

        // Retorna o resultado
        return vendasComProdutos;
    }
}

module.exports = ProdutoGestao;