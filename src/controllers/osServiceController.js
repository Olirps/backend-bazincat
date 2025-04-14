const OSServiceService = require('../services/osServiceService');
const OSWorkflowService = require('../services/OSWorkflowService');

class OSServiceController {

    static async getAllOSService(req, res) {
        try {
            const osServices = await OSServiceService.getAllOSService();
            return res.status(200).json(osServices);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async createOSService(req, res) {
        try {
            const osService = await OSServiceService.createOSService(req.body);
            return res.status(201).json(osService);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async getOSServiceById(req, res) {
        try {
            const osService = await OSServiceService.getOSServiceById(req.params.id);
            if (!osService) {
                return res.status(404).json({ message: 'Ordem de serviço não encontrada' });
            }
            return res.status(200).json(osService);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async updateOSService(req, res) {
        try {
            const osService = await OSServiceService.updateOSService(req.params.id, req.body, req.user.empresa_id);
            if (!osService) {
                return res.status(404).json({ message: 'Ordem de serviço não encontrada' });
            }
            return res.status(200).json(osService);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
    
    static async aprovarOS(req, res) {
        try {
            const osService = await OSServiceService.aprovarOS(req.params.id, req.body);
            if (!osService) {
                return res.status(404).json({ message: 'Ordem de serviço não encontrada' });
            }
            return res.status(200).json(osService);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async deleteOSService(req, res) {
        try {
            await OSServiceService.deleteOSService(req.params.id, req.user.empresa_id);
            return res.status(200).json({ message: 'Ordem de serviço excluída com sucesso' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async obterHistorico(req, res) {
        try {
            const historico = await OSWorkflowService.obterHistorico(req.params.id);
            if (!historico) {
                return res.status(404).json({ message: 'Histórico não encontrado' });
            }
            return res.status(200).json(historico);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
   
    static async removerProdutoOS(req, res) {
        try {
            const produtoRemovido = await OSServiceService.removerProdutoOS(req.params.id,req.body);
            if (!produtoRemovido) {
                return res.status(404).json({ message: 'Remoção não realizada' });
            }
            return res.status(200).json(produtoRemovido);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}

module.exports = OSServiceController;
