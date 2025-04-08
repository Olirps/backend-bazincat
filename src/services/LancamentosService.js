const Lancamentos = require('../models/Lancamentos');
const Vendas = require('../models/Vendas');
const { Op } = require('sequelize');


class LancamentosService {
    /**
     * Registra um novo lançamento.
     * @param {Object} data - Dados do lançamento.
     * @returns {Promise<Object>} - Lançamento criado.
     */
    static async registraLancamento(data) {
        try {
            // Cria um novo lançamento
            data.status = 0; // Status igual a 0 (ativo)
            const lancamentoRegistrado = await Lancamentos.create(data);
            return lancamentoRegistrado;
        } catch (err) {
            console.error('Erro ao registrar lançamento:', err);
            throw new Error('Erro ao registrar lançamento.');
        }
    }

    /**
     * Busca todos os lançamentos.
     * @returns {Promise<Array>} - Lista de lançamentos.
     */
    static async consultaLancamentos(filters = {}) {
        let { dataInicio, dataFim } = filters;

        try {
            const lancamentos = await Lancamentos.findAll({
                where: {
                    status: 0,// Status igual a 0 (ativo)
                    dataLancamento: {
                        [Op.between]: [dataInicio, dataFim] // Filtra por data
                    }
                },
                order: [['id', 'DESC']], // Ordena pelo ID em ordem decrescente
            });
            return lancamentos;
        } catch (err) {
            console.error('Erro ao consultar lançamentos:', err);
            throw new Error('Erro ao consultar lançamentos.');
        }
    }

    /**
     * Busca os lançamentos detalhados associados a uma venda.
     * @param {number} vendaId - ID da venda.
     * @returns {Promise<Array>} - Lançamentos detalhados.
     */
    static async consultaLancamentosPorVenda(vendaId) {
        try {
            const lancamentos = await Lancamentos.findAll({
                where: { venda_id: vendaId },
                order: [['id', 'ASC']], // Ordena pelo ID em ordem crescente
            });

            // Enriquecer os lançamentos com informações adicionais da venda
            const venda = await Vendas.findByPk(vendaId);
            if (venda) {
                lancamentos.forEach(lancamento => {
                    lancamento.dataValues.cliente = venda.cliente;
                    lancamento.dataValues.dataVenda = venda.dataVenda;
                });
            }

            return lancamentos;
        } catch (err) {
            console.error('Erro ao consultar lançamentos por venda:', err);
            throw new Error('Erro ao consultar lançamentos por venda.');
        }
    }

    /**
     * Atualiza um lançamento.
     * @param {number} id - ID do lançamento.
     * @param {Object} data - Dados para atualização.
     * @returns {Promise<Object>} - Lançamento atualizado.
     */
    static async atualizaLancamento(id, data) {
        try {
            const lancamento = await Lancamentos.findByPk(id);
            if (!lancamento) {
                throw new Error('Lançamento não encontrado.');
            }

            await lancamento.update(data);
            return lancamento;
        } catch (err) {
            console.error('Erro ao atualizar lançamento:', err);
            throw new Error('Erro ao atualizar lançamento.');
        }
    }

    /**
     * Exclui um lançamento.
     * @param {number} id - ID do lançamento.
     * @returns {Promise<void>}
     */
    static async excluiLancamento(id) {
        try {
            const lancamento = await Lancamentos.findByPk(id);
            if (!lancamento) {
                throw new Error('Lançamento não encontrado.');
            }

            await lancamento.destroy();
        } catch (err) {
            console.error('Erro ao excluir lançamento:', err);
            throw new Error('Erro ao excluir lançamento.');
        }
    }
}

module.exports = LancamentosService;
