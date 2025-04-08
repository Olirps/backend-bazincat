const FormasPagamento = require("../models/formasPagamento");
const Pagamentos = require("../models/Pagamentos");

class PagamentosService {
    static async registraPagamento(data) {

        const venda = data;

        const PagamentoRegistrado = venda.map((pgto) => ({
            venda_id: pgto.venda_id, // ID da venda registrada
            os_id: pgto.os_id, // ID da OS registrada
            vlrPago: pgto.valor, // Valor Pago por tipo de pgto 
            formapgto_id: pgto.formapgto_id // ID da forma de pagamento associada
        }));

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
            for (let i = 0; i < pagamentoVenda.length; i++) {
                const formaPagamento = await FormasPagamento.findByPk(pagamentoVenda[i].formapgto_id);
                pagamentoVenda[i].formaPagamento = formaPagamento.nome; // Adiciona o nome da forma de pagamento ao objeto
            }

            return pagamentoVenda;
        } catch (err) {
            throw new Error('Erro ao buscar pagamento por venda');
        }
    }
}


module.exports = PagamentosService;
