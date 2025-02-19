const TipoVeiculoService = require('../services/TipoVeiculoService');

class TipoVeiculoController {
    static async obterTodosTipoVeiculo(req, res) {
        try {
            const tiposVeiculo = await TipoVeiculoService.obterTodosTipoVeiculo();
            res.status(200).json(tiposVeiculo);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async obterTipoVeiculoPorId(req, res) {
        try {
            const { id } = req.params;
            const tipoVeiculo = await TipoVeiculoService.obterTipoVeiculoPorId(id);
            if (!tipoVeiculo) {
                return res.status(404).json({ error: 'Tipo de veículo não encontrado' });
            }
            res.status(200).json(tipoVeiculo);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async criarTipoVeiculo(req, res) {
        try {
            const novoTipoVeiculo = await TipoVeiculoService.criarTipoVeiculo(req.body);
            res.status(201).json(novoTipoVeiculo);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async atualizarTipoVeiculo(req, res) {
        try {
            const { id } = req.params;
            const tipoVeiculoAtualizado = await TipoVeiculoService.atualizarTipoVeiculo(id, req.body);
            if (!tipoVeiculoAtualizado) {
                return res.status(404).json({ error: 'Tipo de veículo não encontrado' });
            }
            res.status(200).json(tipoVeiculoAtualizado);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports =  TipoVeiculoController;