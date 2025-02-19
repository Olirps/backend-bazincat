const NotaFiscal = require('../models/NotaFiscal');
const Financeiro = require('../models/Financeiro');
const Clientes = require('../models/Clientes');
const Fornecedores = require('../models/Fornecedores');
const Funcionarios = require('../models/Funcionarios');
const MovimentacaoFinanceira = require('../models/MovimentacaoFinanceira');
const { Op } = require('sequelize');
const { Sequelize, QueryTypes } = require('sequelize');
const sequelize = require('../db');




class ContasPagasService {

    static async getContasPagas() {
        try {
            const hoje = new Date();
            const diaSemana = hoje.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

            // Se não for segunda-feira, ajustar para a última segunda
            if (diaSemana !== 1) {
                const diferenca = diaSemana === 0 ? 6 : diaSemana - 1; // Se for domingo, volta 6 dias
                hoje.setDate(hoje.getDate() - diferenca);
            }

            const segundaFeira = hoje.toISOString().split('T')[0];

            const umaSemanaDepois = new Date(hoje);
            umaSemanaDepois.setDate(hoje.getDate() + 6); // Pegamos até domingo
            const domingo = umaSemanaDepois.toISOString().split('T')[0];

            const query = `
                 SELECT 
                    mf.*,
                    CASE 
                        WHEN fi.fornecedor_id IS NOT NULL THEN fo.nome
                        WHEN fi.cliente_id IS NOT NULL THEN cl.nome
                        WHEN fi.funcionario_id IS NOT NULL THEN (SELECT nome FROM dbgerencialceleiro.clientes WHERE id = fu.cliente_id)
                        WHEN fi.credor_nome is not null then fi.credor_nome
                    END AS credor_nome,
                    cb.nome AS conta_bancaria_nome
                FROM 
                    dbgerencialceleiro.financeiro fi
                    LEFT JOIN dbgerencialceleiro.fornecedores fo ON fo.id = fi.fornecedor_id
                    LEFT JOIN dbgerencialceleiro.clientes cl ON cl.id = fi.cliente_id
                    LEFT JOIN dbgerencialceleiro.funcionarios fu ON fu.id = fi.funcionario_id
                    INNER JOIN dbgerencialceleiro.movimentacaofinanceira mf ON (mf.financeiro_id = fi.id and fi.status <> 'cancelada')
                    INNER JOIN dbgerencialceleiro.contasbancarias cb ON cb.id = mf.conta_id
                WHERE fi.tipo = 'debito' 
                AND mf.status = 'liquidado'
                ORDER BY mf.data_pagamento DESC;
            `;

            const contas = await sequelize.query(query, {
                replacements: { segundaFeira, domingo },
                type: QueryTypes.SELECT
            });

            return contas;
        } catch (error) {
            console.error('Erro ao buscar contas a pagar da semana:', error);
            throw new Error('Erro ao buscar contas a pagar da semana');
        }
    }

}

module.exports = ContasPagasService;
