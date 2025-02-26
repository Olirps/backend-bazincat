const MovimentacaoFinanceiraService = require('../services/MovimentacaoFinanceiraService');

class MovimentacaoFinanceiraController {

    /**
     * Retorna todas as movimentações financeiras com base nos filtros fornecidos.
     * @param {Object} req - Objeto de requisição do Express.
     * @param {Object} res - Objeto de resposta do Express.
     */
    static async getAll(req, res) {
        try {
            const filters = req.query; // Filtros passados na query string
            const movimentacoes = await MovimentacaoFinanceiraService.getAll(filters);
            res.status(200).json(movimentacoes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Cria uma nova movimentação financeira.
     * @param {Object} req - Objeto de requisição do Express.
     * @param {Object} res - Objeto de resposta do Express.
     */
    static async create(req, res) {
        try {
            const movimentacaoData = req.body; // Dados da movimentação financeira
            const novaMovimentacao = await MovimentacaoFinanceiraService.create(movimentacaoData);
            res.status(201).json(novaMovimentacao);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Atualiza uma movimentação financeira existente.
     * @param {Object} req - Objeto de requisição do Express.
     * @param {Object} res - Objeto de resposta do Express.
     */
    static async update(req, res) {
        try {
            const { id } = req.params; // ID da movimentação financeira
            const movimentacaoData = req.body; // Dados atualizados
            const movimentacaoAtualizada = await MovimentacaoFinanceiraService.update(id, movimentacaoData);
            res.status(200).json(movimentacaoAtualizada);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Deleta uma movimentação financeira.
     * @param {Object} req - Objeto de requisição do Express.
     * @param {Object} res - Objeto de resposta do Express.
     */
    static async delete(req, res) {
        try {
            const { id } = req.params; // ID da movimentação financeira
            await MovimentacaoFinanceiraService.delete(id);
            res.status(204).send(); // Resposta sem conteúdo (sucesso)
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = MovimentacaoFinanceiraController;
