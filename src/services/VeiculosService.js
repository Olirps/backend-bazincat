// src/services/VeiculosService.js
const Veiculos = require('../models/Veiculos');

class VeiculosService {
  static async criarVeiculos(dados) {
    if (dados.placa) {
      // Verificar se a placa já existe
      const VeiculosExistente = await Veiculos.findOne({ where: { placa: dados.placa } });
      if (VeiculosExistente) {
        throw new Error('Já existe um Veiculo com esta placa.');
      }
    }

    try {
      return await Veiculos.create(dados);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async obterTodosVeiculos(filtro) {
    try {
      return await Veiculos.findAll({ where: filtro });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async obterVeiculosPorId(id) {
    try {
      return await Veiculos.findByPk(id);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async atualizarVeiculos(id, dados) {
    try {
      const [updated] = await Veiculos.update(dados, {
        where: { id }
      });
      if (updated) {
        return await Veiculos.findByPk(id);
      }
      return null;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async deletarVeiculos(id) {
    try {
      return await Veiculos.destroy({
        where: { id }
      });
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

module.exports = VeiculosService;
