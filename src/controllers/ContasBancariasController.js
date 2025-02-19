const ContasBancariasService = require('../services/ContasBancariasService');


class ContasBancariasController {
    static async getAllContas(req, res) {
        try {
            const bancos = await ContasBancariasService.getAllContas();
            return res.status(200).json(bancos);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async createContaBancaria(req, res) {
        try {
            const conta = await ContasBancariasService.createContaBancaria(req.body);
            return res.status(201).json(conta);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async getContaBancariaById(req, res) {
        try {
            const conta = await ContasBancariasService.getContaBancariaById(req.params.id);
            if (!conta) {
                return res.status(404).json({ message: 'Conta Bancaria not found' });
            }
            return res.status(200).json(conta);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async updateContaBancaria(req, res) {
        try {
            const conta = await ContasBancariasService.updateContaBancaria(req.params.id, req.body);
            if (!conta) {
                return res.status(404).json({ message: 'Conta Bancaria not found' });
            }
            return res.status(200).json(conta);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}


module.exports = ContasBancariasController;
