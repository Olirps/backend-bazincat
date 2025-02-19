const BancoService = require('../services/BancoService');


class BancoController {
  static async getAllBancos(req, res) {
    try {
      const bancos = await BancoService.getAllBancos();
      return res.status(200).json(bancos);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}


module.exports = BancoController;
