const MovimentacaoFinanceira = require('../models/MovimentacaoFinanceira');
const Financeiro = require('../models/Financeiro');
const Fornecedores = require('../models/Fornecedores');
const Clientes = require('../models/Clientes');
const Funcionarios = require('../models/Funcionarios');
const { Op } = require('sequelize');

class MovimentacaoFinanceiraService {

    /**
     * Retorna todas as movimentações financeiras com base nos filtros fornecidos.
     * @param {Object} filters - Objeto contendo os filtros a serem aplicados.
     * @returns {Promise<Array>} - Lista de movimentações financeiras com dados complementares.
     */

    static async getAll(filters = {}) {
        try {
            const { dataInicio, dataFim, tipoMovimentacao, cliente_id, fornecedor, fornecedor_id, funcionario_id, status, cnpj } = filters;

            // Limpa o CNPJ do filtro
            const cnpjFiltro = cnpj ? limparCNPJ(cnpj) : null;

            // Filtros para a tabela MovimentacaoFinanceira (data de vencimento e status)
            const whereMovimentacao = {};

            if (dataInicio && dataFim) {
                whereMovimentacao.vencimento = {
                    [Op.between]: [new Date(dataInicio), new Date(dataFim)]
                };
            }
            if (status) {
                whereMovimentacao.status = status;
            }

            // Busca as movimentações financeiras na tabela MovimentacaoFinanceira
            const movimentacoes = await MovimentacaoFinanceira.findAll({
                where: whereMovimentacao,
                order: [['vencimento', 'ASC']] // Ordenação por dataVencimento em ordem decrescente
            });

            // Para cada movimentação, busca os dados complementares na tabela Financeiro e os nomes relacionados
            const movimentacoesCompletas = await Promise.all(
                movimentacoes.map(async (movimentacao) => {
                    const financeiro = await Financeiro.findOne({
                        where: { id: movimentacao.financeiro_id } // Assumindo que há uma chave estrangeira financeiroId em MovimentacaoFinanceira
                    });

                    // Busca os nomes dos relacionamentos
                    const fornecedor = financeiro && financeiro.fornecedor_id
                        ? await Fornecedores.findByPk(financeiro.fornecedor_id)
                        : null;

                    const cliente = financeiro && financeiro.cliente_id
                        ? await Clientes.findByPk(financeiro.cliente_id)
                        : null;

                    const funcionario = financeiro && financeiro.funcionario_id
                        ? await Funcionarios.findByPk(financeiro.funcionario_id)
                        : null;

                    // Combina os dados de MovimentacaoFinanceira, Financeiro e os nomes relacionados
                    return {
                        ...movimentacao.get({ plain: true }),
                        tipoMovimentacao: financeiro ? financeiro.tipoMovimentacao : null,
                        cliente_id: financeiro ? financeiro.cliente_id : null,
                        cliente_nome: cliente ? cliente.nome : null,
                        fornecedor_id: financeiro ? financeiro.fornecedor_id : null,
                        fornecedor_nome: fornecedor ? fornecedor.nome : null,
                        fornecedor_cnpj: fornecedor ? limparCNPJ(fornecedor.cpfCnpj) : null, // Limpa o CNPJ do fornecedor
                        funcionario_id: financeiro ? financeiro.funcionario_id : null,
                        funcionario_nome: funcionario ? funcionario.nome : null,
                        credor_nome: financeiro ? financeiro.credor_nome : null
                    };
                })
            );

            // Aplica filtros adicionais (tipoMovimentacao, clienteId, fornecedorId, funcionarioId, fornecedorNome, CNPJ)
            const filteredMovimentacoes = movimentacoesCompletas.filter((movimentacao) => {
                let match = true;

                if (tipoMovimentacao && movimentacao.tipoMovimentacao !== tipoMovimentacao) {
                    match = false;
                }
                if (cliente_id && movimentacao.cliente_id !== cliente_id) {
                    match = false;
                }
                if (fornecedor_id && movimentacao.fornecedor_id !== fornecedor_id) {
                    match = false;
                }
                if (funcionario_id && movimentacao.funcionario_id !== funcionario_id) {
                    match = false;
                }
                // Filtro por nome do fornecedor
                if (fornecedor && !movimentacao?.fornecedor_nome?.toLowerCase().includes(fornecedor.toLowerCase())) {
                    match = false;
                }
                // Filtro por CNPJ do fornecedor
                if (cnpjFiltro && movimentacao.fornecedor_cnpj !== cnpjFiltro) {
                    match = false;
                }

                return match;
            });

            return filteredMovimentacoes;
        } catch (error) {
            throw new Error(`Erro ao buscar movimentações financeiras: ${error.message}`);
        }
    }
    /**
     * Cria uma nova movimentação financeira.
     * @param {Object} movimentacaoData - Dados da movimentação financeira.
     * @returns {Promise<Object>} - Movimentação financeira criada.
     */
    static async create(movimentacaoData) {
        try {
            // Cria o registro na tabela Financeiro primeiro
            const financeiro = await Financeiro.create({
                tipoMovimentacao: movimentacaoData.tipoMovimentacao,
                cliente_id: movimentacaoData.cliente_id,
                fornecedor_id: movimentacaoData.fornecedor_id,
                funcionario_id: movimentacaoData.funcionario_id,
                credor_nome: movimentacaoData.credor_nome
            });

            // Cria o registro na tabela MovimentacaoFinanceira
            const movimentacao = await MovimentacaoFinanceira.create({
                dataVencimento: movimentacaoData.dataVencimento,
                financeiroId: financeiro.id // Assumindo que há uma chave estrangeira financeiroId em MovimentacaoFinanceira
            });

            return {
                ...movimentacao.get({ plain: true }),
                tipoMovimentacao: financeiro.tipoMovimentacao,
                cliente_id: financeiro.cliente_id,
                fornecedor_id: financeiro.fornecedor_id,
                funcionario_id: financeiro.funcionario_id,
                credor_nome: financeiro.credor_nome
            };
        } catch (error) {
            throw new Error(`Erro ao criar movimentação financeira: ${error.message}`);
        }
    }

    /**
     * Atualiza uma movimentação financeira existente.
     * @param {number} id - ID da movimentação financeira.
     * @param {Object} movimentacaoData - Dados atualizados da movimentação financeira.
     * @returns {Promise<Object>} - Movimentação financeira atualizada.
     */
    static async update(id, movimentacaoData) {
        try {
            const movimentacao = await MovimentacaoFinanceira.findByPk(id);
            if (!movimentacao) {
                throw new Error('Movimentação financeira não encontrada');
            }

            // Atualiza a tabela Financeiro
            const financeiro = await Financeiro.findByPk(movimentacao.financeiroId);
            if (financeiro) {
                await financeiro.update({
                    tipoMovimentacao: movimentacaoData.tipoMovimentacao,
                    cliente_id: movimentacaoData.cliente_id,
                    fornecedor_id: movimentacaoData.fornecedor_id,
                    funcionario_id: movimentacaoData.funcionario_id,
                    credor_nome: movimentacaoData.credor_nome
                });
            }

            // Atualiza a tabela MovimentacaoFinanceira
            await movimentacao.update({
                dataVencimento: movimentacaoData.dataVencimento
            });

            return {
                ...movimentacao.get({ plain: true }),
                tipoMovimentacao: financeiro.tipoMovimentacao,
                cliente_id: financeiro.cliente_id,
                fornecedor_id: financeiro.fornecedor_id,
                funcionario_id: financeiro.funcionario_id,
                credor_nome: financeiro.credor_nome
            };
        } catch (error) {
            throw new Error(`Erro ao atualizar movimentação financeira: ${error.message}`);
        }
    }

    /**
     * Deleta uma movimentação financeira.
     * @param {number} id - ID da movimentação financeira.
     * @returns {Promise<boolean>} - True se a movimentação foi deletada com sucesso.
     */
    static async delete(id) {
        try {
            const movimentacao = await MovimentacaoFinanceira.findByPk(id);
            if (!movimentacao) {
                throw new Error('Movimentação financeira não encontrada');
            }

            // Deleta o registro na tabela Financeiro
            const financeiro = await Financeiro.findByPk(movimentacao.financeiroId);
            if (financeiro) {
                await financeiro.destroy();
            }

            // Deleta o registro na tabela MovimentacaoFinanceira
            await movimentacao.destroy();
            return true;
        } catch (error) {
            throw new Error(`Erro ao deletar movimentação financeira: ${error.message}`);
        }
    }
}

function limparCNPJ(cnpj) {
    return cnpj.replace(/\D/g, ''); // Remove tudo que não for dígito
}


module.exports = MovimentacaoFinanceiraService;