const TipoTransacao = require('../models/TipoTransacao');

class TipoTransacaoService {
    static async listarTodos() {
        return await TipoTransacao.findAll({ order: [['descricao', 'ASC']] });
    }

    static async buscarPorId(id) {
        const tipo = await TipoTransacao.findByPk(id);
        if (!tipo) throw new Error('Tipo de transação não encontrado');
        return tipo;
    }

    static async criar(descricao) {
        return await TipoTransacao.create({ descricao });
    }

    static async atualizar(id, descricao) {
        const tipo = await this.buscarPorId(id);
        tipo.descricao = descricao;
        await tipo.save();
        return tipo;
    }

    static async remover(id) {
        const tipo = await this.buscarPorId(id);
        await tipo.destroy();
    }
}

module.exports = TipoTransacaoService;