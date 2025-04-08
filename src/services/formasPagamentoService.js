const FormasPagamento = require('../models/formasPagamento');

class FormasPagamentoService {
    // Buscar todas as formas de pagamento
    static async listarTodas() {
        return await FormasPagamento.findAll();
    }

    // Buscar forma de pagamento por ID
    static async buscarPorId(id) {
        return await FormasPagamento.findByPk(id);
    }

    // Criar nova forma de pagamento
    static async criar(nome) {
        return await FormasPagamento.create({ nome });
    }

    // Atualizar forma de pagamento por ID
    static async atualizar(id, nome) {
        const formaPagamento = await FormasPagamento.findByPk(id);
        if (!formaPagamento) throw new Error('Forma de pagamento não encontrada');

        formaPagamento.nome = nome;
        await formaPagamento.save();
        return formaPagamento;
    }

    // Deletar forma de pagamento por ID
    static async deletar(id) {
        const formaPagamento = await FormasPagamento.findByPk(id);
        if (!formaPagamento) throw new Error('Forma de pagamento não encontrada');

        await formaPagamento.destroy();
    }
}

module.exports = FormasPagamentoService;
