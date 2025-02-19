// src/services/FornecedoresService.js
const Fornecedores = require('../models/Fornecedores');
const { validarCpf, limpaDocumento, validarCnpj } = require('../util/util');
const { Op } = require('sequelize');
const NotaFiscal = require("../models/NotaFiscal");


class FornecedoresService {

  static async criarFornecedores(dados) {

    let sizeCpfCnpj = (dados.cpfCnpj ?? dados.CNPJ)?.length;
    let cpfCnpjLimpo = "";

    if (sizeCpfCnpj == 11) {
      cpfCnpjLimpo = (dados.cpfCnpj ?? dados.CNPJ)?.replace(/\D/g, ''); // Remove caracteres não numéricos
      if (!validarCpf(cpfCnpjLimpo) & sizeCpfCnpj == 11) {
        throw new Error(`CPF: ${(dados.cpfCnpj ?? dados.CNPJ)} é inválido`);
      }
      const fornecedoresExistente = await Fornecedores.findOne({ where: { cpfCnpj: cpfCnpjLimpo } });
      if (fornecedoresExistente) {
        throw new Error(`CPF: ${(dados.cpfCnpj ?? dados.CNPJ)} já cadastrado`);
      }
    } else {
      cpfCnpjLimpo = (dados.cpfCnpj ?? dados.CNPJ)?.replace(/\D/g, ''); // Remove caracteres não numéricos

      if (!validarCnpj(cpfCnpjLimpo)) {
        throw new Error(`CNPJ: ${(dados.cpfCnpj ?? dados.CNPJ)} é inválido`);
      }
      const fornecedoresExistente = await Fornecedores.findOne({ where: { cpfCnpj: cpfCnpjLimpo } });
      if (fornecedoresExistente) {
        throw new Error(`CNPJ: ${(dados.cpfCnpj ?? dados.CNPJ)} já cadastrado`);
      }
    }
    try {
      // Cria novo fornecedores
      const createdFornecedor = await Fornecedores.create({ ...dados, cpfCnpj: (dados.cpfCnpj ?? dados.CNPJ) });
      return createdFornecedor
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async obterTodasFornecedores(filtro) {
    try {
      return await Fornecedores.findAll({ where: filtro });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async obterFornecedoresPorId(id) {
    try {
      return await Fornecedores.findByPk(id);
    } catch (err) {
      throw new Error(err.message);
    }
  }
  
  static async obterFornecedoresPorFiltro(query) {
    try {
      const filtro = {};
      if (query.razaoSocial.trim()) {
        filtro.nome = { [Op.like]: `%${query.razaoSocial.trim()}%` };
      }
      if (query.nomeFantasia) {
        filtro.nomeFantasia = { [Op.like]: `%${query.nomeFantasia.trim()}%` };
      }
      if (query.cnpj) {
        filtro.cpfCnpj = { [Op.like]: `%${query.cnpj.trim()}%` };
      }

      return await Fornecedores.findAll({ where: filtro });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async atualizarFornecedores(id, dados) {
    // Processar os dados da pessoa antes de atualizar
    const fornecedores = limpaDocumento(dados);
    if (fornecedores.cpfCnpj.length == 11) {
      // Validar o CPF
      if (!validarCpf(fornecedores.cpfCnpj)) {
        throw new Error(`CPF: ${fornecedores.cpfCnpj} é inválido`);
      }
    } else {
      // Validar o CPF
      if (!validarCnpj(fornecedores.cpfCnpj)) {
        throw new Error(`CPF: ${fornecedores.cpfCnpj} é inválido`);
      }
    }

    const fornecedoresExistente = await Fornecedores.findOne({ where: { cpfCnpj: fornecedores.cpfCnpj } });
    if (fornecedoresExistente) {
      if (fornecedoresExistente.id != id) {
        throw new Error(`CPF: ${dados.cpfCnpj} já cadastrado`);
      }
    }

    try {
      // Tentar atualizar o registro no banco de dados
      const [updated] = await Fornecedores.update(fornecedores, {
        where: { id } // Filtro para encontrar o registro pelo ID
      });

      if (updated) {
        // Se o registro foi atualizado, buscar e retornar a pessoa atualizada
        return await Fornecedores.findByPk(id);
      }

      // Se não foi atualizado, retornar null
      return null;
    } catch (err) {
      // Lançar um erro com a mensagem original
      throw new Error(err.message);
    }
  }



  static async deletarFornecedores(id) {
    try {
      return await Fornecedores.destroy({
        where: { id }
      });
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

module.exports = FornecedoresService;