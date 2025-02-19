// src/services/MarcaService.js
const TipoVeiculo = require('../models/TipoVeiculo');

class TipoVeiculoService {
  static async criarTipoVeiculo(dados) {
    const tipoveiculoexistente = await TipoVeiculo.findOne({ where: { nome: dados.nome } });
    if (tipoveiculoexistente) {
      throw new Error(`Tipo Veículo ${dados.nome} Já Cadastrado`);
    }
    try {
      return await TipoVeiculo.create(dados);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async obterTodosTipoVeiculo() {
    try {
      return await TipoVeiculo.findAll();
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async obterTipoVeiculoPorId(id) {
    try {
      return await TipoVeiculo.findByPk(id);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async atualizarTipoVeiculo(id, dados) {
    try {
      const [updated] = await TipoVeiculo.update(dados, {
        where: { id }
      });
      if (updated) {
        return await TipoVeiculo.findByPk(id);
      }
      return null;
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

module.exports = TipoVeiculoService;
