// src/controllers/ProdutosController.js
const PagamentosService = require('../services/PagamentosService');
const { Op } = require('sequelize');

class PagamentosController {
        // Criação de um novo produto
        static async registraPagamento(req, res) {
            try {
                const pagamentoRegistrado = await PagamentosService.registraPagamento(req.body);
                res.status(201).json(pagamentoRegistrado);
            } catch (error) {
                res.status(400).json({ erro: error.message });
            }
        }

        static async consultaPagamentos(req,res){
            try {
                const pagamentosRealizadas = await PagamentosService.consultaPagamentos(req.body);
                res.status(200).json(pagamentosRealizadas);
            } catch (error) {
                res.status(400).json({ erro: error.message });
            }
        }
        static async consultaPagamentoPorVenda(req,res){
            try {
                const pagamentosRealizadas = await PagamentosService.consultaPagamentoPorVenda(req.params.id);
                res.status(200).json(pagamentosRealizadas);
            } catch (error) {
                res.status(400).json({ erro: error.message });
            }
        }

}
module.exports = PagamentosController;