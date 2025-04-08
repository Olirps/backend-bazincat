const FormasPagamentoService = require('../services/formasPagamentoService');

class FormasPagamentoController {
    // Listar todas as formas de pagamento
    static async listarTodas(req, res) {
        try {
            const formasPagamento = await FormasPagamentoService.listarTodas();
            return res.status(200).json(formasPagamento);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar formas de pagamento' });
        }
    }

    // Buscar forma de pagamento por ID
    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const formaPagamento = await FormasPagamentoService.buscarPorId(Number(id));
            if (!formaPagamento) {
                return res.status(404).json({ error: 'Forma de pagamento não encontrada' });
            }
            return res.status(200).json(formaPagamento);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar forma de pagamento' });
        }
    }

    // Criar nova forma de pagamento
    static async criar(req, res) {
        try {
            const { nome } = req.body;
            if (!nome) {
                return res.status(400).json({ error: 'Nome da forma de pagamento é obrigatório' });
            }

            const novaFormaPagamento = await FormasPagamentoService.criar(nome);
            return res.status(201).json(novaFormaPagamento);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao criar forma de pagamento' });
        }
    }

    // Atualizar forma de pagamento
    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { nome } = req.body;

            if (!nome) {
                return res.status(400).json({ error: 'Nome da forma de pagamento é obrigatório' });
            }

            const formaPagamentoAtualizada = await FormasPagamentoService.atualizar(Number(id), nome);
            return res.status(200).json(formaPagamentoAtualizada);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar forma de pagamento' });
        }
    }

    // Deletar forma de pagamento
    static async deletar(req, res) {
        try {
            const { id } = req.params;
            await FormasPagamentoService.deletar(Number(id));
            return res.status(204).send(); // No content
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao deletar forma de pagamento' });
        }
    }
}

module.exports = FormasPagamentoController;
