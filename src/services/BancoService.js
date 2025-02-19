const Banco = require('../models/Banco');

class BancoService {

    static async getAllBancos() {
      try {
        return await Banco.findAll();
      } catch (error) {
        throw new Error(`Erro ao buscar bancos: ${error.message}`);
      }
    }
  }
  
  module.exports = BancoService;
  