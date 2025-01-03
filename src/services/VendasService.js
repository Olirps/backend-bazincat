const Produtos = require('../models/Produtos');
const Vendas = require("../models/Vendas");
const VendasItens = require('../models/VendasItens');
const Pagamentos = require('../services/PagamentosService');

class VendasService {
    static async registraVenda(data) {
        // console.log('Entrou no Service: '+JSON.stringify(data))
        const itensVenda = data.products;
        let pagamentos = data.pagamentos;

        if(data.cliente_id === ''){
            data.cliente_id = 176
        }
        const vendaRegistrada = await Vendas.create(data)
        
        pagamentos = pagamentos.map(pagamento => ({
            ...pagamento,
            venda_id: vendaRegistrada.id,
          })); 
        
        Pagamentos.registraPagamento(pagamentos);

        // Mapeia os itens para associar com o ID da venda registrada
        const itensVendaRegistrada = itensVenda.map((item) => ({
            venda_id: vendaRegistrada.id, // ID da venda registrada
            produto_id: item.id,          // ID do produto vendido
            quantity: parseFloat(item.quantity).toFixed(3), // Quantidade do produto
            vlrVenda: item.total            // Preço do produto
        }));


        const itensVendidos = await VendasItens.bulkCreate(itensVendaRegistrada)

        return vendaRegistrada;
    }

    static async consultaVendas() {
        try {
            // Filtra as vendas com status igual a 0 (ativo)
            const vendas = await Vendas.findAll({
                where: {
                    status: 0 // Status igual a 0 (ativo)
                },
                order: [['id', 'DESC']] // Ordena pelo ID em ordem decrescente
            });
    
            // Iterar sobre cada venda para buscar as formas de pagamento
            for (let venda of vendas) {
                // Busca as formas de pagamento relacionadas à venda
                const formasPagamento = await Pagamentos.consultaPagamentoPorVenda(venda.id);
    
                // Extrai apenas o campo formaPagamento
                venda.dataValues.formaPagamento = formasPagamento.map(fp => fp.formaPagamento);
            }
    
            return vendas;
        } catch (err) {
            throw new Error('Erro ao buscar todas as vendas');
        }
    }

    static async consultaVendasDetalhado(id) {
        try {
            // Filtra as vendas com status igual a 0 (ativo)
            const vendas = await Vendas.findAll({
                where: {
                    status: 0 // Status igual a 0 (ativo)
                },
                order: [['id', 'DESC']] // Ordena pelo ID em ordem decrescente
            });
    
            // Iterar sobre cada venda para buscar as formas de pagamento e valores pagos
            for (let venda of vendas) {
                // Busca as formas de pagamento relacionadas à venda
                const formasPagamento = await Pagamentos.consultaPagamentoPorVenda(venda.id);
    
                // Estrutura detalhada: tipo de pagamento e valor pago
                venda.dataValues.formaPagamento = formasPagamento.map(fp => ({
                    formaPagamento: fp.formaPagamento,
                    vlrPago: fp.vlrPago // Assume que `vlrPago` é o campo no modelo de pagamentos
                }));
            }
    
            return vendas;
        } catch (err) {
            throw new Error('Erro ao buscar todas as vendas detalhadas');
        }
    }
    
    

    static async consultaItensPorVenda(id) {
        try {
            // Busca os itens da venda
            let itensVenda = await VendasItens.findAll({
                where: {
                    venda_id: id
                },
                order: [['id', 'ASC']]
            });

            // Enriquecer os itens com o nome do produto (xProd)
            for (let item of itensVenda) {
                const produto = await Produtos.findByPk(item.produto_id);
                if (produto) {
                    item.dataValues.xProd = produto.xProd; // Adiciona o campo xProd ao item
                    item.dataValues.vlrUnitario = produto.vlrVenda; // Adiciona o campo xProd ao item
                }
            }

            return itensVenda;
        } catch (err) {
            throw new Error('Erro ao buscar itens por venda');
        }
    }


}


module.exports = VendasService;
