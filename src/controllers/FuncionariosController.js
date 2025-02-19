const FuncionariosService = require('../services/FuncionariosService');
const { Op } = require('sequelize');

class FuncionariosController {

    static async createFuncionarios(req, res) {
        try {
            const funcionario = await FuncionariosService.createFuncionarios(req.body);
            return res.status(201).json(funcionario);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }


    static async getAllFuncionarios(req, res) {
        try {
            const { cpfCnpj, nome } = req.query; // Obtém os parâmetros da requisição
            const where = {};

            // Aplica filtro de CPF/CNPJ se fornecido
            if (cpfCnpj) {
                where.cpfCnpj = { [Op.like]: `%${cpfCnpj}%` };
            }

            // Aplica filtro de nome se fornecido
            if (nome) {
                where.nome = { [Op.like]: `%${nome}%` };
            }
            const funcionarios = await FuncionariosService.getAllFuncionarios(where);
            return res.status(200).json(funcionarios);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async getFuncionarioById(req, res) {
        try {
            const funcionario = await FuncionariosService.getFuncionarioById(req.params.id);
            if (!funcionario) {
                return res.status(404).json({ error: 'Funcionario não encontrado' });
            }
            return res.status(200).json(funcionario);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async obterFuncionariosPorFiltro(req, res) {
        try {
            const filtros = req.query; // Obtém os filtros do corpo da requisição
            const funcionarios = await FuncionariosService.obterFuncionariosPorFiltro(filtros);
            res.status(200).json(funcionarios);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }


    static async updateFuncionario(req, res) {
        try {
            const updatedFuncionario = await FuncionariosService.updateFuncionario(req.params.id, req.body);
            if (!updatedFuncionario) {
                return res.status(404).json({ error: 'Funcionario não encontrado' });
            }
            return res.status(200).json(updatedFuncionario);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}

module.exports = FuncionariosController;