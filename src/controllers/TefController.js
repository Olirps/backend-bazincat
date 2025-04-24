const TefService = require('../services/TefService');

class TefController {
  static async criarTransacao(req, res) {
    const { pagamento_id, venda_id, transacaoData } = req.body;

    try {
      const transacao = await TefService.criarTransacaoTEF(pagamento_id, venda_id, transacaoData);
      return res.status(201).json(transacao); // Retorna a transação criada com sucesso
    } catch (error) {
      return res.status(500).json({ message: `Erro ao criar transação TEF: ${error.message}` });
    }
  }
}

module.exports = TefController;
