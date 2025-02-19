const Pagamentos = require("../models/Pagamentos");

class PagamentosService {
    static async registraPagamento(data) {

        const venda = data;

        const PagamentoRegistrado = venda.map((pgto) => ({
            venda_id: pgto.venda_id, // ID da venda registrada
            vlrPago: pgto.valor, // Valor Pago por tipo de pgto 
            formaPagamento: pgto.forma // forma do pagamento
        }));

        //const PagamentoRegistrado = await Pagamentos.create(data)

        // Mapeia os itens para associar com o ID da venda registrada
        


        const PagamentosRegistrado = await Pagamentos.bulkCreate(PagamentoRegistrado)

        return PagamentosRegistrado;
    }

    static async consultaPagamentos() {
        try {
            // Filtra as vendas com status igual a 0 (ativo)
            return await Pagamentos.findAll({
                where: {
                    //status: 0 // Status igual a 0 (ativo)
                },
                order: [['id', 'DESC']] // Ordena pelo ID em ordem decrescente
            });
        } catch (err) {
            throw new Error('Erro ao buscar todas os pagamentos');
        }
    }

    static async consultaPagamentoPorVenda(id) {
        try {
            // Busca os pagamentos da venda
            let pagamentoVenda = await Pagamentos.findAll({
                where: {
                    venda_id: id
                },
                order: [['id', 'ASC']]
            });

            // Enriquecer os itens com o nome do produto (xProd)
        
            return pagamentoVenda;
        } catch (err) {
            throw new Error('Erro ao buscar pagamento por venda');
        }
    }
}


module.exports = PagamentosService;
