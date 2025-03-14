const Produtos = require('../models/Produtos');
const Vendas = require("../models/Vendas");
const VendasItens = require('../models/VendasItens');
const MovimentacoesEstoque = require('../models/MovimentacoesEstoque');
const Pagamentos = require('./PagamentosService');
const Lancamentos = require('./LancamentosService');
const {  QueryTypes } = require('sequelize');
const sequelize = require('../db');

class ProdutoGestao {
    static async consultaProdutosVendidos() {
        // Busca todas as vendas
        const vendas = await Vendas.findAll(
            {
                where: {
                    status: 0
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

    static async produtosMaisVendidosSemana() {
        try {

            const hoje = new Date();
            const diaSemana = hoje.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

            // Se não for segunda-feira, ajustar para a última segunda
            if (diaSemana !== 1) {
                const diferenca = diaSemana === 0 ? 6 : diaSemana - 1; // Se for domingo, volta 6 dias
                hoje.setDate(hoje.getDate() - diferenca);
            }

            const segundaFeira = hoje.toISOString().split('T')[0];

            const umaSemanaDepois = new Date(hoje);
            umaSemanaDepois.setDate(hoje.getDate() + 6); // Pegamos até domingo
            const domingo = umaSemanaDepois.toISOString().split('T')[0];

            const query =
                `select vi.produto_id,
                    pr.xProd,
                    pr.uCom,
                    case
                            when pr.uCom = 'UN' then round(SUM(vi.quantity), 0) 
                                else SUM(vi.quantity) 
                    end as total_quantity
            from vendaitens vi
            inner join vendas ve on (ve.id = vi.venda_id)
            inner join produtos pr on (pr.id = vi.produto_id)
            where ve.dataVenda between :segundaFeira and :domingo
            group by 1, 2, 3
            order by total_quantity desc;`
                ;

            const contas = await sequelize.query(query, {
                replacements: { segundaFeira, domingo },
                type: QueryTypes.SELECT
            });

            return contas;
        } catch (error) {
            console.error('Erro ao buscar contas a pagar da semana:', error);
            throw new Error('Erro ao buscar contas a pagar da semana');
        }
    }

}

module.exports = ProdutoGestao;