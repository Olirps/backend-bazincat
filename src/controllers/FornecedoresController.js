// src/controllers/FornecedoresController.js
const FornecedoresService = require('../services/FornecedoresService');
const { limpaDocumento } = require('../util/util');
const { Op } = require('sequelize');

class FornecedoresController {

  // src/controllers/FornecedoresController.js

  static async criarFornecedores(req, res) {
    try {

      // Dentro de um endpoint, por exemplo:
      const fornecedor = limpaDocumento(req.body);

      // Passar os dados limpos para o serviço
      const fornecedores = await FornecedoresService.criarFornecedores(fornecedor);

      // Retornar a resposta com o status 201 (Criado)
      res.status(201).json(fornecedores);
    } catch (err) {
      // Retornar erro com status 400 (Solicitação Incorreta)
      res.status(400).json({ error: err.message });
    }
  }

  static async obterTodasFornecedores(req, res) {
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

      const fornecedores = await FornecedoresService.obterTodasFornecedores(where);
      res.status(200).json(fornecedores);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
  static async obterFornecedoresPorId(req, res) {
    try {
      const fornecedores = await FornecedoresService.obterFornecedoresPorId(req.params.id);
      if (fornecedores) {
        res.status(200).json(fornecedores);
      } else {
        res.status(404).json({ error: 'Fornecedor não encontrada' });
      }
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async obterFornecedoresPorFiltro(req, res) {
    try {
      const filtros = req.query; // Obtém os filtros do corpo da requisição
      const fornecedores = await FornecedoresService.obterFornecedoresPorFiltro(filtros);
      res.status(200).json(fornecedores);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
  
  static async atualizarFornecedores(req, res) {
    try {
      // Dentro de um endpoint, por exemplo:
      const fornecedores = await FornecedoresService.atualizarFornecedores(req.params.id, req.body);

      if (fornecedores) {
        res.status(200).json(fornecedores);
      } else {
        res.status(404).json({ error: 'Fornecedor não encontrada' });
      }
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async deletarFornecedores(req, res) {
    try {
      const deleted = await FornecedoresService.deletarFornecedores(req.params.id);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Fornecedor não encontrada' });
      }
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = FornecedoresController;
