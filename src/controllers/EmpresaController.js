const EmpresaService = require('../services/EmpresaService');

class EmpresaController {
    static async getAllEmpresas(req, res) {
        try {
            const empresas = await EmpresaService.getAllEmpresas();
            res.status(200).json(empresas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getEmpresaById(req, res) {
        try {
            const empresa = await EmpresaService.getEmpresaById(req.params.id);
            if (!empresa) {
                return res.status(404).json({ error: 'Empresa not found' });
            }
            res.status(200).json(empresa);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async createEmpresa(req, res) {
        try {
            const newEmpresa = await EmpresaService.createEmpresa(req.body);
            res.status(201).json(newEmpresa);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateEmpresa(req, res) {
        try {
            const updatedEmpresa = await EmpresaService.updateEmpresa(req.params.id, req.body);
            if (!updatedEmpresa) {
                return res.status(404).json({ error: 'Empresa not found' });
            }
            res.status(200).json(updatedEmpresa);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteEmpresa(req, res) {
        try {
            const deletedEmpresa = await EmpresaService.deleteEmpresa(req.params.id);
            if (!deletedEmpresa) {
                return res.status(404).json({ error: 'Empresa not found' });
            }
            res.status(200).json({ message: 'Empresa deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = EmpresaController;