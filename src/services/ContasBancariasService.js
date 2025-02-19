const ContasBancarias = require('../models/ContasBancarias');

class ContasBancariasSercice {

    static async getAllContas() {
      try {
        return await ContasBancarias.findAll();
      } catch (error) {
        throw new Error(`Erro ao buscar bancos: ${error.message}`);
      }
    }

    static async createContaBancaria(contaBancariaData) {
      try {
        const novaContaBancaria = await ContasBancarias.create(contaBancariaData);
        return novaContaBancaria;
      } catch (error) {
        throw new Error(`Erro ao criar conta bancária: ${error.message}`);
      }
    }

    static async getContaBancariaById(id) {
      try {
      const contaBancaria = await ContasBancarias.findByPk(id);
      if (!contaBancaria) {
        throw new Error('Conta bancária não encontrada');
      }
      return contaBancaria;
      } catch (error) {
      throw new Error(`Erro ao buscar conta bancária: ${error.message}`);
      }
    }

    static async updateContaBancaria(id, contaBancariaData) {
      try {
      const contaBancaria = await ContasBancarias.findByPk(id);
      if (!contaBancaria) {
        throw new Error('Conta bancária não encontrada');
      }
      await contaBancaria.update(contaBancariaData);
      return contaBancaria;
      } catch (error) {
      throw new Error(`Erro ao atualizar conta bancária: ${error.message}`);
      }
    }
  }
  
  module.exports = ContasBancariasSercice;