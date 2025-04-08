const { dataAtual } = require('../util/util');

const OSWorkflow = require("../models/OSWorkflow");

class OSWorkflowService {
    static async registrarMudanca(os_id, status_id, status_nome, login = null) {
        try {
            const mudanca = await OSWorkflow.create({
                os_id,
                status_id,
                status_nome,
                login,
                data_mudanca: dataAtual(),
            });

            return mudanca;
        } catch (error) {
            console.error("Erro ao registrar mudança de status:", error);
            throw new Error("Não foi possível registrar a mudança de status.");
        }
    }

    static async obterHistorico(os_id) {
        try {
            return await OSWorkflow.findAll({
                where: { os_id },
                order: [["data_mudanca", "ASC"]],
            });
        } catch (error) {
            console.error("Erro ao obter histórico de status:", error);
            throw new Error("Não foi possível obter o histórico de status.");
        }
    }
}

module.exports = OSWorkflowService;
