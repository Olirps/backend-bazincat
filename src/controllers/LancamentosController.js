const LancamentosService = require('../services/LancamentosService');

class LancamentosController {
    
    static async registraLancamento(req, res) {
        try {
            const lancamento = await LancamentosService.registraLancamento(req.body);
            res.status(201).json(lancamento);
        } catch (error) {
            console.error('Erro ao registrar lançamento:', error);
            res.status(500).json({ error: 'Erro ao registrar lançamento.' });
        }
    }

    static async consultaLancamentos(req, res) {
        try {
            const lancamentos = await LancamentosService.consultaLancamentos(req.body);
            res.status(200).json(lancamentos);
        } catch (error) {
            console.error('Erro ao consultar lançamentos:', error);
            res.status(500).json({ error: 'Erro ao consultar lançamentos.' });
        }
    }

   
    static async consultaLancamentosPorVenda(req, res) {
        try {
            const { vendaId } = req.params;
            const lancamentos = await LancamentosService.consultaLancamentosPorVenda(vendaId);
            res.status(200).json(lancamentos);
        } catch (error) {
            console.error('Erro ao consultar lançamentos por venda:', error);
            res.status(500).json({ error: 'Erro ao consultar lançamentos por venda.' });
        }
    }

    
    static async atualizaLancamento(req, res) {
        try {
            const { id } = req.params;
            const lancamento = await LancamentosService.atualizaLancamento(id, req.body);
            res.status(200).json(lancamento);
        } catch (error) {
            console.error('Erro ao atualizar lançamento:', error);
            res.status(500).json({ error: 'Erro ao atualizar lançamento.' });
        }
    }

   
    static async excluiLancamento(req, res) {
        try {
            const { id } = req.params;
            await LancamentosService.excluiLancamento(id);
            res.status(204).send(); // No Content
        } catch (error) {
            console.error('Erro ao excluir lançamento:', error);
            res.status(500).json({ error: 'Erro ao excluir lançamento.' });
        }
    }
}

module.exports = LancamentosController;
