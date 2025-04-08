const OSStatus = require('../models/os_status');

class OSStatusService {

    static async getAllOSStatus(filtros) {
        try {
            // Usando diretamente os filtros no where, caso existam
            const whereClause = { };

            // Se filtros forem passados, adicionar à cláusula where
            if (filtros) {
                Object.assign(whereClause, filtros);
            }

            return await OSStatus.findAll({
                where: whereClause,
                order: [['ordem', 'ASC']],
            });
        } catch (error) {
            throw new Error(`Erro ao buscar status da OS: ${error.message}`);
        }
    }


    static async createOSStatus(osStatusData) {
        try {
            const novoOSStatus = await OSStatus.create(osStatusData);
            return novoOSStatus;
        } catch (error) {
            throw new Error(`Erro ao criar status de OS: ${error.message}`);
        }
    }

    static async getOSStatusById(id) {
        try {
            const osStatus = await OSStatus.findByPk(id);
            if (!osStatus) {
                throw new Error('Status da OS não encontrado');
            }
            return osStatus;
        } catch (error) {
            throw new Error(`Erro ao buscar status da OS: ${error.message}`);
        }
    }

    static async updateOSStatus(id, osStatusData) {
        try {
            const osStatus = await OSStatus.findByPk(id);
            if (!osStatus) {
                throw new Error('Status da OS não encontrado');
            }
            await osStatus.update(osStatusData);
            return osStatus;
        } catch (error) {
            throw new Error(`Erro ao atualizar status da OS: ${error.message}`);
        }
    }

    static async deleteOSStatus(id) {
        try {
            const osStatus = await OSStatus.findByPk(id);
            if (!osStatus) {
                throw new Error('Status da OS não encontrado');
            }
            await osStatus.destroy();
            return { message: 'Status de OS excluído com sucesso' };
        } catch (error) {
            throw new Error(`Erro ao excluir status da OS: ${error.message}`);
        }
    }
}

module.exports = OSStatusService;
