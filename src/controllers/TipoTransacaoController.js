const TipoTransacaoService = require('../services/TipoTransacaoService')

class TipoTransacaoController {
    static async listar(req, res) {
        try {
            const tipos = await TipoTransacaoService.listarTodos();
            return res.json(tipos);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async buscar(req, res) {
        try {
            const { id } = req.params;
            const tipo = await TipoTransacaoService.buscarPorId(id);
            return res.json(tipo);
        } catch (error) {
            return res.status(404).json({ message: error.message });
        }
    }

    static async criar(req, res) {
        try {
            const { descricao } = req.body;
            const tipo = await TipoTransacaoService.criar(descricao);
            return res.status(201).json(tipo);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { descricao } = req.body;
            const tipo = await TipoTransacaoService.atualizar(id, descricao);
            return res.json(tipo);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    static async remover(req, res) {
        try {
            const { id } = req.params;
            await TipoTransacaoService.remover(id);
            return res.status(204).send();
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
}

module.exports = TipoTransacaoController;