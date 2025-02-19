// src/controllers/MarcaController.js
const VinculoProdVeiculoService = require('../services/VinculoProdVeiculoService');

class VinculoProdVeiculoController {
    static async criarVinculo(req, res) {
        try {
            const vinculo = await VinculoProdVeiculoService.criarVinculo(req.body);
            res.status(201).json(vinculo);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    static async obterTodasVinculos(req, res) {
        try {
            const vinculos = await VinculoProdVeiculoService.obterTodasVinculos();
            res.status(200).json(vinculos);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    static async obterVinculoPorId(req, res) {
        try {
            const vinculo = await VinculoProdVeiculoService.obterVinculoPorId(req.params.id);
            if (vinculo) {
                res.status(200).json(vinculo);
            } else {
                res.status(404).json({ error: 'Vinculo não encontrada' });
            }
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    
    static async obterVinculoPorVeiculoId(req, res) {
        try {
            const vinculo = await VinculoProdVeiculoService.obterVinculoPorVeiculoId(produtoId,notaFiscalId);
            if (vinculo) {
                res.status(200).json(vinculo);
            } else {
                res.status(404).json({ error: 'Vinculo não encontrada' });
            }
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    static async obterVinculoPorProdutoId(req, res) {
        try {
            const { produtoId, notaFiscalId } = req.params;

            const vinculo = await VinculoProdVeiculoService.getVinculoPorProdutoId(produtoId, notaFiscalId);
            if (vinculo) {
                res.status(200).json(vinculo);
            } else {
                res.status(404).json({ error: 'Vinculo não encontrada' });
            }
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    static async atualizarVinculo(req, res) {
        try {
            const vinculo = await VinculoProdVeiculoService.atualizarVinculo(req.params.id, req.body);
            if (vinculo) {
                res.status(200).json(vinculo);
            } else {
                res.status(404).json({ error: 'Vinculo não encontrada' });
            }
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    static async getVinculoProdVeiculoAll(req, res) {
        try {
            const vinculos = await VinculoProdVeiculoService.getVinculoProdVeiculoAll();
            return res.status(200).json(vinculos);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = VinculoProdVeiculoController;
