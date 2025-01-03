// src/controllers/ProdutosController.js
const VendasService = require('../services/VendasService');
const { Op } = require('sequelize');

class VendasController {
        // Criação de um novo produto
        static async registraVenda(req, res) {
          //  console.log('Entrou no Controller: '+JSON.stringify(req.body))
            try {
                const saleRegistered = await VendasService.registraVenda(req.body);
                res.status(201).json(saleRegistered);
            } catch (error) {
                res.status(400).json({ erro: error.message });
            }
        }

        static async consultaVendas(req,res){
            try {
                const vendasRealizadas = await VendasService.consultaVendas(req.body);
                res.status(200).json(vendasRealizadas);
            } catch (error) {
                res.status(400).json({ erro: error.message });
            }
        }
        static async consultaVendasDetalhado(req,res){
            try {
                const vendasRealizadas = await VendasService.consultaVendasDetalhado(req.params.id);
                res.status(200).json(vendasRealizadas);
            } catch (error) {
                res.status(400).json({ erro: error.message });
            }
        }
        static async consultaItensPorVenda(req,res){
            try {
                const vendasRealizadas = await VendasService.consultaItensPorVenda(req.params.id);
                res.status(200).json(vendasRealizadas);
            } catch (error) {
                res.status(400).json({ erro: error.message });
            }
        }

}
module.exports = VendasController;