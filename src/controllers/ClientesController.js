// src/controllers/ClientesController.js
const ClientesService = require('../services/ClientesService');
const { limpaDocumento } = require('../util/util');
const { Op } = require('sequelize');

class ClientesController {

  // src/controllers/ClientesController.js

  static async criarClientes(req, res) {
    try {

      // Dentro de um endpoint, por exemplo:
      const cliente = limpaDocumento(req.body);

      // Passar os dados limpos para o serviço
      const clientes = await ClientesService.criarClientes(cliente);

      // Retornar a resposta com o status 201 (Criado)
      res.status(201).json(clientes);
    } catch (err) {
      // Retornar erro com status 400 (Solicitação Incorreta)
      res.status(400).json({ error: err.message });
    }
  }

  static async obterTodosClientes(req, res) {
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

      const clientes = await ClientesService.obterTodosClientes(where);

      if (clientes.length === 0) {
        return res.status(404).json({ message: "Nenhum cliente encontrado com os filtros fornecidos." });
      }

      res.status(200).json(clientes);
    } catch (err) {
      console.error("Erro ao obter clientes:", err);
      res.status(500).json({ error: "Erro ao processar a solicitação." });
    }
  }

  static async obterClientePorId(req, res) {
    try {
      const clientes = await ClientesService.obterClientePorId(req.params.id);
      if (clientes) {
        res.status(200).json(clientes);
      } else {
        res.status(404).json({ error: 'Cliente não encontrado' });
      }
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  
  static async obterClientesPorFiltro(req, res) {
    try {
      const filtros = req.query; // Obtém os filtros do corpo da requisição
      const clientes = await ClientesService.obterClientesPorFiltro(filtros);
      res.status(200).json(clientes);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
  
  static async atualizarCliente(req, res) {
    try {
      // Dentro de um endpoint, por exemplo:
      const clientes = await ClientesService.atualizarCliente(req.params.id, req.body);

      if (clientes) {
        res.status(200).json(clientes);
      } else {
        res.status(404).json({ error: 'Cliente não encontrado' });
      }
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async deletarCliente(req, res) {
    try {
      const deleted = await ClientesService.deletarCliente(req.params.id);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Cliente não encontrada' });
      }
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = ClientesController;
