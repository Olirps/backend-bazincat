const OSStatusService = require('../services/osStatusService');

class OSStatusController {

    static async getAllOSStatus(req, res) {
        try {
            const osStatuses = await OSStatusService.getAllOSStatus(req.query);
            return res.status(200).json(osStatuses);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async createOSStatus(req, res) {
        try {
            const osStatus = await OSStatusService.createOSStatus(req.body);
            return res.status(201).json(osStatus);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async getOSStatusById(req, res) {
        try {
            const osStatus = await OSStatusService.getOSStatusById(req.params.id);
            if (!osStatus) {
                return res.status(404).json({ message: 'Status da OS não encontrado' });
            }
            return res.status(200).json(osStatus);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async updateOSStatus(req, res) {
        try {
            const osStatus = await OSStatusService.updateOSStatus(req.params.id, req.body);
            if (!osStatus) {
                return res.status(404).json({ message: 'Status da OS não encontrado' });
            }
            return res.status(200).json(osStatus);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async deleteOSStatus(req, res) {
        try {
            await OSStatusService.deleteOSStatus(req.params.id);
            return res.status(200).json({ message: 'Status de OS excluído com sucesso' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}

module.exports = OSStatusController;
