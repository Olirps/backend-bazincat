const GrupoAcesso = require('../models/GrupoAcesso');

class GrupoAcessoService {
    static async createGrupoAcesso(data) {
        try {
            const grupoAcesso = await GrupoAcesso.create(data);
            return grupoAcesso;
        } catch (error) {
            throw new Error('Error creating GrupoAcesso');
        }
    }

    static async getAllGrupoAcesso() {
        try {
            const gruposAcesso = await GrupoAcesso.findAll();
            return gruposAcesso;
        } catch (error) {
            throw new Error('Error fetching all GrupoAcesso');
        }
    }

    static async getGrupoAcessoById(id) {
        try {
            const grupoAcesso = await GrupoAcesso.findByPk(id);
            if (!grupoAcesso) {
                throw new Error('GrupoAcesso not found');
            }
            return grupoAcesso;
        } catch (error) {
            throw new Error('Error fetching GrupoAcesso by ID');
        }
    }
}

module.exports= GrupoAcessoService;