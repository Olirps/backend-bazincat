const FinanceiroService = require('../services/FinanceiroService');
const ContasPagasService = require('../services/ContasPagasService');

class FinanceiroController {

    static async createLancamentos(req, res) {
        try {
            const lancamento = await FinanceiroService.createLancamentos(req.body);
            return res.status(201).json(lancamento);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }


    static async getAllLancamentosFinanceiroDespesa(req, res) {
        try {
            const lancamentos = await FinanceiroService.getAllLancamentosFinanceiroDespesa(req.query);
            return res.status(200).json(lancamentos);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async getLancamentosParaUnificar(req, res) {
        try {
            const filters = req.query; // Filtros passados na query string

            const lancamentos = await FinanceiroService.getLancamentosParaUnificar(filters);
            return res.status(200).json(lancamentos);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    // Buscar um lançamento financeiro de despesa pelo ID
    static async getLancamentoDespesaById(req, res) {
        try {
            const { id } = req.params;
            const lancamento = await FinanceiroService.getLancamentoDespesaById(id);

            if (!lancamento) {
                return res.status(404).json({ message: 'Lançamento não encontrado' });
            }

            return res.status(200).json(lancamento);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async createMovimentacaoFinanceira(req, res) {
        try {
            const movimentacao = await FinanceiroService.createMovimentacaoFinanceira(req.body);
            return res.status(201).json(movimentacao);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async getMovimentacaoFinanceiraByFinanceiroID(req, res) {
        try {

            const movimentacao = await FinanceiroService.getMovimentacaoFinanceiraByFinanceiroID(req.params.id, req.query);

            if (!movimentacao) {
                return res.status(404).json({ message: 'Movimentação não encontrada' });
            }

            return res.status(200).json(movimentacao);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async getParcelaByID(req, res) {
        try {
            const { id } = req.params;
            const parcela = await FinanceiroService.getParcelaByID(id);

            if (!parcela) {
                return res.status(404).json({ message: 'Parcela não encontrada' });
            }

            return res.status(200).json(parcela);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async updateMovimentacaoFinanceira(req, res) {
        try {
            const { id } = req.params;
            const updatedMovimentacao = await FinanceiroService.updateMovimentacaoFinanceira(id, req.body);

            if (!updatedMovimentacao) {
                return res.status(404).json({ message: 'Movimentação não encontrada' });
            }

            return res.status(200).json(updatedMovimentacao);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async updateLancamentoFinanceiro(req, res) {
        try {
            const { id } = req.params;
            const updatedLancamento = await FinanceiroService.updateLancamentoFinanceiro(id, req.body);

            if (!updatedLancamento) {
                return res.status(404).json({ message: 'Lançamento não encontrado' });
            }

            return res.status(200).json(updatedLancamento);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async getLancamentoCompletoById(req, res) {
        try {
            const { id } = req.params;
            const lancamentoCompleto = await FinanceiroService.getLancamentoCompletoById(id);

            if (!lancamentoCompleto) {
                return res.status(404).json({ message: 'Lançamento completo não encontrado' });
            }

            return res.status(200).json(lancamentoCompleto);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async getContaPagarSemana(req, res) {
        try {
            const contas = await FinanceiroService.getContaPagarSemana();
            return res.status(200).json(contas);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async getContasPagas(req, res) {
        try {
            const contasPagas = await ContasPagasService.getContasPagas();
            return res.status(200).json(contasPagas);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}

module.exports = FinanceiroController;