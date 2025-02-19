const GrupoAcessoService = require('../services/GrupoAcessoService');

class GrupoAcessoController {

    static async createGrupoAcesso  (req, res) {
        try {
            const grupoAcesso = await GrupoAcessoService.createGrupoAcesso(req.body);
            return res.status(201).json(grupoAcesso);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }


    static async getAllGrupoAcesso(req, res) {
        try {
            const gruposAcesso = await GrupoAcessoService.getAllGrupoAcesso();
            return res.status(200).json(gruposAcesso);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async getGrupoAcessoById(req, res) {
        try {
            const grupoAcesso = await GrupoAcessoService.getGrupoAcessoById(req.params.id);
            if (!grupoAcesso) {
                return res.status(404).json({ error: 'Grupo de acesso não encontrado' });
            }
            return res.status(200).json(grupoAcesso);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    /*
    async update(req, res) {
        try {
            const grupoAcesso = await GrupoAcessoService.update(req.params.id, req.body);
            if (!grupoAcesso) {
                return res.status(404).json({ error: 'Grupo de acesso não encontrado' });
            }
            return res.status(200).json(grupoAcesso);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const grupoAcesso = await GrupoAcessoService.delete(req.params.id);
            if (!grupoAcesso) {
                return res.status(404).json({ error: 'Grupo de acesso não encontrado' });
            }
            return res.status(204).send();
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }*/
}

module.exports =  GrupoAcessoController;

