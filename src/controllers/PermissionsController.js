const PermissionsService = require('../services/PermissionsService');

class PermissionsController {

    static async createPermission  (req, res) {
        try {
            const permission = await PermissionsService.createPermission(req.body);
            return res.status(201).json(permission);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }


    static async getAllPermissions(req, res) {
        try {
           
            const permissions = await PermissionsService.getAllPermissions();
            return res.status(200).json(permissions);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async updatePermission(req, res) {
        try {
            const grupoAcessoPermissao = await PermissionsService.updatePermission(req.params.id, req.body);
            if (!grupoAcessoPermissao) {
                return res.status(404).json({ error: 'Grupo de acesso não encontrado' });
            }
            return res.status(200).json(grupoAcessoPermissao);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

}
module.exports = PermissionsController;
