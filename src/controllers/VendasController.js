// src/controllers/ProdutosController.js
const VendasService = require('../services/VendasService');
const { Op } = require('sequelize');

class VendasController {
    // Criação de um novo produto
    static async registraVenda(req, res) {
        try {
            const saleRegistered = await VendasService.registraVenda(req.body);
            res.status(201).json(saleRegistered);
        } catch (error) {
            res.status(400).json({ erro: error.message });
        }
    }

    static async consultaVendas(req, res) {
        try {
            const vendasRealizadas = await VendasService.consultaVendas(req.body);
            res.status(200).json(vendasRealizadas);
        } catch (error) {
            res.status(400).json({ erro: error.message });
        }
    }
    static async consultaVendasDetalhado(req, res) {
        try {
            const vendasRealizadas = await VendasService.consultaVendasDetalhado(req.query);
            res.status(200).json(vendasRealizadas);
        } catch (error) {
            res.status(400).json({ erro: error.message });
        }
    }
    static async consultaItensPorVenda(req, res) {
        try {
            const vendasRealizadas = await VendasService.consultaItensPorVenda(req.params.id);
            res.status(200).json(vendasRealizadas);
        } catch (error) {
            res.status(400).json({ erro: error.message });
        }
    }
    // Atualização de um produto por ID
    static async cancelaVenda(req, res) {
        try {
            const vendaCancelada = await VendasService.cancelaVenda(req.params.id, req.body);
            res.status(200).json(vendaCancelada);
        } catch (error) {
            res.status(400).json({ erro: error.message });
        }
    }
    // Consultar Venda por ID
    static async consultaVendaPorId(req, res) {
        try {
            const venda = await VendasService.consultaVendaPorId(req.params.id);
            res.status(200).json(venda);
        } catch (error) {
            res.status(400).json({ erro: error.message });
        }
    }

    static async addXMLAssinado(req, res) {
        try {
            const xmlAssinado = await VendasService.addXMLAssinado(req.params.id, req.body);
            res.status(200).json(xmlAssinado);
        } catch (error) {
            res.status(400).json({ erro: error.message });
        }
    }


}
module.exports = VendasController;