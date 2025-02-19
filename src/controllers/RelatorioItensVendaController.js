const RelatorioItensVendaService = require('../services/RelatorioItensVendaService');

class RelatorioItensVendaController {
    static async getRelatorioItensVenda(req, res) {
        try {
            const relatorio = await RelatorioItensVendaService.getItensVendidosPorPeriodo(req.body);
            res.status(200).json(relatorio);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = RelatorioItensVendaController;