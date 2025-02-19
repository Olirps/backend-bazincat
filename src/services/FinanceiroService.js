const NotaFiscal = require('../models/NotaFiscal');
const Financeiro = require('../models/Financeiro');
const Clientes = require('../models/Clientes');
const Fornecedores = require('../models/Fornecedores');
const Funcionarios = require('../models/Funcionarios');
const MovimentacaoFinanceira = require('../models/MovimentacaoFinanceira');
const { Op } = require('sequelize');
const { Sequelize, QueryTypes } = require('sequelize');
const sequelize = require('../db');




class FinanceiroService {
  static async createLancamentos(dadosFinanceiro) {
    try {
      const despesa = await Financeiro.create({
        nota_id: dadosFinanceiro.notaId || null,
        descricao: dadosFinanceiro.descricao,
        tipo: dadosFinanceiro.tipo,
        credor_nome: dadosFinanceiro.credor_nome || null,
        cliente_id: dadosFinanceiro.cliente_id || null,
        fornecedor_id: dadosFinanceiro.fornecedor_id || null,
        funcionario_id: dadosFinanceiro.funcionario_id || null,
        valor: dadosFinanceiro.valor,
        data_lancamento: dadosFinanceiro.data_lancamento,
        tipo_lancamento: 'manual',
        tipo_parcelamento: dadosFinanceiro.tipo_parcelamento,
        pagamento: dadosFinanceiro.pagamento,
        data_vencimento: dadosFinanceiro.dtVencimento,
        status: dadosFinanceiro.status || 'andamento'
      });
      if (dadosFinanceiro.pagamento === 'recorrente') {
        const movimentacao = {
          financeiro_id: despesa.id,
          valor_parcela: dadosFinanceiro.valor,
          vencimento: dadosFinanceiro.data_vencimento,
          descricao: `${dadosFinanceiro.descricao} - Parcela 1 / 1`,
          status: 'pendente',
          parcela: 1 // Parcela única
        };
        await MovimentacaoFinanceira.create(movimentacao);
      } else if (dadosFinanceiro.pagamento === 'cotaunica') {
        const movimentacao = {
          financeiro_id: despesa.id,
          valor_parcela: dadosFinanceiro.valor,
          vencimento: dadosFinanceiro.data_vencimento,
          descricao: `${dadosFinanceiro.descricao} - Parcela 1 / 1`,
          status: 'pendente',
          parcela: 1 // Parcela única
        };
        await MovimentacaoFinanceira.create(movimentacao);
      } else if (dadosFinanceiro.pagamento === 'parcelada') {
        const valorEntrada = parseFloat((dadosFinanceiro.valorEntradaDespesa || '0')); // Default to 0 if undefined
        const valorTotal = parseFloat(dadosFinanceiro.valor); // Valor total da despesa
        const valorRestante = valorTotal - valorEntrada; // Calcula o valor restante após a entrada
        const qtdParcelas = dadosFinanceiro.lancarParcelas.length; // Número de parcelas
        //const valorParcela = valorRestante / qtdParcelas; // Valor de cada parcela
        //const valorParcelaArredondado = parseFloat(valorParcela.toFixed(2)); // Arredondamos para 2 casas decimais

        const dataVencimentoInicial = new Date(dadosFinanceiro.data_vencimento); // Data de vencimento da primeira parcela

        // Se houver valor de entrada, cria a parcela de entrada (parcela 0)
        if (valorEntrada > 0) {
          const movimentacaoEntrada = {
            financeiro_id: despesa.id,
            valor_parcela: valorEntrada,
            vencimento: dadosFinanceiro.data_vencimento, // A entrada vence na mesma data da primeira parcela
            descricao: `${dadosFinanceiro.descricao} - Entrada`,
            status: 'pendente',
            parcela: 0 // Parcela de entrada
          };
          await MovimentacaoFinanceira.create(movimentacaoEntrada);
        }

        // Cria as parcelas
        for (let i = 0; i < qtdParcelas; i++) {
          const dataVencimentoParcela = new Date(dataVencimentoInicial);

          if (dadosFinanceiro.tipo_parcelamento === 'mensal') {
            // Para o parcelamento mensal, adiciona i meses à data inicial
            dataVencimentoParcela.setMonth(dataVencimentoInicial.getMonth() + i);
          } else if (dadosFinanceiro.tipo_parcelamento === 'anual') {
            // Para o parcelamento anual, adiciona i anos à data inicial
            dataVencimentoParcela.setFullYear(dataVencimentoInicial.getFullYear() + i);
          }

          const movimentacao = {
            financeiro_id: despesa.id,
            //valor_parcela: i === qtdParcelas - 1 ? valorRestante - valorParcelaArredondado * (qtdParcelas - 1) : valorParcelaArredondado, // Ajusta o valor da última parcela
            valor_parcela: parseFloat(dadosFinanceiro.lancarParcelas[i].valor.replace(/[^0-9,-]/g, '').replace(',', '.')),
            //vencimento: dataVencimentoParcela.toISOString().split('T')[0], // Formata a data para YYYY-MM-DD
            vencimento: dadosFinanceiro.lancarParcelas[i].dataVencimento, // Formata a data para YYYY-MM-DD
            descricao: `${dadosFinanceiro.descricao} - Parcela ${i + 1} / ${qtdParcelas}`,
            status: 'pendente',
            parcela: i + 1 // Número da parcela
          };

          await MovimentacaoFinanceira.create(movimentacao);
        }

      }

      return despesa;
    } catch (error) {
      console.error('Erro ao registrar despesa:', error);
      throw new Error('Erro ao registrar despesa');
    }
  }



  static async getAllLancamentosFinanceiroDespesa() {
    try {
      const financeiro = await Financeiro.findAll({
        where: {
          tipo: 'debito',
          status: {
            [Op.notIn]: ['cancelada', 'liquidado'] // Exclui registros com status "cancelada" ou "liquidado"
          }
        },
        raw: true, // Transforma os dados em objetos JS puros para evitar problemas com Sequelize
        order: [['id', 'DESC']]
      });

      const financeiroComDetalhes = await Promise.all(financeiro.map(async (lancamento) => {
        let entidade = null;
        let entidadeNome = null;

        if (lancamento.fornecedor_id) {
          entidade = await Fornecedores.findOne({
            where: { id: lancamento.fornecedor_id },
            raw: true
          });
          entidadeNome = 'fornecedor';
        } else if (lancamento.funcionario_id) {

          entidade = await Funcionarios.findOne({
            where: { id: lancamento.funcionario_id },
            raw: true
          });

          // Busca o nome do funcionário na tabela Clientes, caso haja correspondência
          const cliente = await Clientes.findOne({
            where: { id: entidade.cliente_id },
            attributes: ['nome'],
            raw: true
          });

          entidade = { ...entidade, nome: cliente?.nome || null };
          entidadeNome = 'funcionario';
        } else if (lancamento.cliente_id) {
          entidade = await Clientes.findOne({
            where: { id: lancamento.cliente_id },
            raw: true
          });
          entidadeNome = 'cliente';
        }

        return {
          ...lancamento,
          [entidadeNome]: entidade
        };
      }));

      return financeiroComDetalhes;
    } catch (error) {
      console.error('Erro ao buscar lançamentos:', error);
      throw new Error('Erro ao buscar lançamentos');
    }
  }


  static async getLancamentoDespesaById(id) {
    try {
      const lancamento = await Financeiro.findOne({
        where: { id, tipo: 'debito' },
        raw: true // Para retornar um objeto JavaScript comum
      });

      if (!lancamento) {
        throw new Error('Lançamento financeiro não encontrado');
      }

      let entidade = null;
      let entidadeNome = null;

      if (lancamento.fornecedor_id) {
        entidade = await Fornecedores.findOne({ where: { id: lancamento.fornecedor_id }, raw: true });
        entidadeNome = 'fornecedor';
      } else
        if (lancamento.funcionario_id) {
          entidade = await Funcionarios.findOne({ where: { id: lancamento.funcionario_id }, raw: true });

          // Verifica se o funcionário tem um cliente associado
          if (entidade.cliente_id) {
            const cliente = await Clientes.findOne({ where: { id: entidade.cliente_id }, raw: true });
            entidade.cliente = cliente; // Adiciona o cliente ao objeto do funcionário
          }
          entidadeNome = 'funcionario';
        } else if (lancamento.cliente_id) {
          entidade = await Clientes.findOne({ where: { id: lancamento.cliente_id }, raw: true });
          entidadeNome = 'cliente';
        }

      return {
        ...lancamento,
        [entidadeNome]: entidade
      };
    } catch (error) {
      console.error('Erro ao buscar lançamento:', error);
      throw new Error('Erro ao buscar lançamento financeiro');
    }
  }

  static async createMovimentacaoFinanceira(dadosMovimentacao) {
    try {

      let parcelas = {};
      if (dadosMovimentacao.quantidadeParcelas > 1) {

        const valorEntrada = parseFloat((dadosMovimentacao.valorEntrada || '0')); // Default to 0 if undefined
        const valorTotal = parseFloat(dadosMovimentacao.valor); // Valor total da despesa
        const valorRestante = valorTotal - valorEntrada; // Calcula o valor restante após a entrada
        const qtdParcelas = dadosMovimentacao.parcelas.length; // Número de parcelas
        const valorParcela = valorRestante / qtdParcelas; // Valor de cada parcela
        const valorParcelaArredondado = parseFloat(valorParcela.toFixed(2)); // Arredondamos para 2 casas decimais

        const dataVencimentoInicial = new Date(dadosMovimentacao.vencimento); // Data de vencimento da primeira parcela

        // Se houver valor de entrada, cria a parcela de entrada (parcela 0)
        if (valorEntrada > 0) {
          const movimentacaoEntrada = {
            financeiro_id: dadosMovimentacao.financeiro_id,
            valor_parcela: valorEntrada,
            vencimento: dadosMovimentacao.vencimento, // A entrada vence na mesma data da primeira parcela
            descricao: `${dadosMovimentacao.descricao} - Entrada`,
            status: 'pendente',
            parcela: 0 // Parcela de entrada
          };
          await MovimentacaoFinanceira.create(movimentacaoEntrada);
        }

        // Cria as parcelas normais (1, 2, 3, ...)
        for (let i = 0; i < qtdParcelas; i++) {
          const dataVencimentoParcela = new Date(dataVencimentoInicial);

          if (dadosMovimentacao.tipo_parcelamento === 'mensal') {
            // Para o parcelamento mensal, adiciona i meses à data inicial
            dataVencimentoParcela.setMonth(dataVencimentoInicial.getMonth() + i);
          } else if (dadosMovimentacao.tipo_parcelamento === 'anual') {
            // Para o parcelamento anual, adiciona i anos à data inicial
            dataVencimentoParcela.setFullYear(dataVencimentoInicial.getFullYear() + i);
          }

          const movimentacao = {
            financeiro_id: dadosMovimentacao.financeiro_id,
            //valor_parcela: i === qtdParcelas - 1 ? valorRestante - valorParcelaArredondado * (qtdParcelas - 1) : valorParcelaArredondado, // Ajusta o valor da última parcela
            valor_parcela: parseFloat(dadosMovimentacao.parcelas[i].valor.replace(/[^0-9,-]/g, '').replace(',', '.')),
            //vencimento: dataVencimentoParcela.toISOString().split('T')[0], // Formata a data para YYYY-MM-DD
            vencimento: dadosMovimentacao.parcelas[i].dataVencimento, // Formata a data para YYYY-MM-DD
            descricao: `${dadosMovimentacao.descricao} - Parcela ${i + 1} / ${qtdParcelas}`,
            status: 'pendente',
            parcela: i + 1 // Número da parcela
          };

          parcelas = await MovimentacaoFinanceira.create(movimentacao);
          if (parcelas) {
            const financeiro = await Financeiro.findByPk(dadosMovimentacao.financeiro_id);
            const status = { status: 'andamento' }
            await financeiro.update(status)
          }
        }
        /*for (let i = 0; i < qtdParcelas; i++) {
          const dataVencimentoParcela = new Date(dataVencimentoInicial);
          dataVencimentoParcela.setMonth(dataVencimentoInicial.getMonth() + i); // Adiciona i meses à data inicial

          const movimentacao = {
            financeiro_id: dadosMovimentacao.financeiro_id,
            valor_parcela: i === qtdParcelas - 1 ? valorRestante - valorParcelaArredondado * (qtdParcelas - 1) : valorParcelaArredondado, // Ajusta o valor da última parcela
            vencimento: dataVencimentoParcela.toISOString().split('T')[0], // Formata a data para YYYY-MM-DD
            descricao: `${dadosMovimentacao.descricao} - Parcela ${i + 1} / ${qtdParcelas}`,
            status: 'pendente',
            parcela: i + 1 // Número da parcela
          };
          parcelas = await MovimentacaoFinanceira.create(movimentacao);
          if (parcelas) {
            const financeiro = await Financeiro.findByPk(dadosMovimentacao.financeiro_id);
            const status = { status: 'andamento' }
            await financeiro.update(status)
          }
        }*/
      } else {
        const valorTotal = parseFloat(dadosMovimentacao.valor); // Valor total da despesa
        const valorEntrada = parseFloat((dadosMovimentacao.valorEntrada || '0')); // Default to 0 if undefined
        const valorRestante = valorTotal - valorEntrada; // Calcula o valor restante após a entrada

        // Se houver valor de entrada, cria a parcela de entrada (parcela 0)
        if (valorEntrada > 0) {

          const movimentacaoEntrada = {
            financeiro_id: dadosMovimentacao.financeiro_id,
            valor_parcela: valorEntrada,
            vencimento: dadosMovimentacao.vencimento, // A entrada vence na mesma data da primeira parcela
            descricao: `${dadosMovimentacao.descricao} - Entrada`,
            status: 'pendente',
            parcela: 0 // Parcela de entrada
          };
          await MovimentacaoFinanceira.create(movimentacaoEntrada);
        }

        parcelas = await MovimentacaoFinanceira.create({
          descricao: dadosMovimentacao.descricao + 'Parcela 1 / 1',
          parcela: 1,
          financeiro_id: dadosMovimentacao.financeiro_id,
          tipo: dadosMovimentacao.tipo,
          valor_parcela: parseFloat(dadosMovimentacao.parcelas[0].valor.replace(/[^0-9,-]/g, '').replace(',', '.')),
          vencimento: dadosMovimentacao.parcelas[0].dataVencimento,
          descricao: dadosMovimentacao.descricao
        });
        if (parcelas) {
          const financeiro = await Financeiro.findByPk(dadosMovimentacao.financeiro_id);
          const status = { status: 'andamento' }
          await financeiro.update(status)
        }
      }

      return parcelas;
    } catch (error) {
      console.error('Erro ao registrar movimentação financeira:', error);
      throw new Error('Erro ao registrar movimentação financeira');
    }
  }


  static async getMovimentacaoFinanceiraByFinanceiroID(financeiro_id) {
    try {
      const movimentacoes = await MovimentacaoFinanceira.findAll({
        where: {
          financeiro_id,
          status: 'pendente'
        },
        raw: true
      });

      return movimentacoes;
    } catch (error) {
      console.error('Erro ao buscar movimentações financeiras:', error);
      throw new Error('Erro ao buscar movimentações financeiras');
    }
  }

  static async getParcelaByID(id) {
    try {
      const movimentacoes = await MovimentacaoFinanceira.findByPk(id);

      return movimentacoes;
    } catch (error) {
      console.error('Erro ao buscar parcela:', error);
      throw new Error('Erro ao buscar parcela');
    }
  }

  static async updateMovimentacaoFinanceira(id, dadosAtualizados) {
    try {
      const movimentacao = await MovimentacaoFinanceira.findByPk(id);

      if (!movimentacao) {
        throw new Error('Movimentação financeira não encontrada');
      }

      const parcelaLiquidada = await movimentacao.update(dadosAtualizados);

      if (parcelaLiquidada) {
        const movimentacoes = await MovimentacaoFinanceira.findAll({
          where: {
            financeiro_id: movimentacao.financeiro_id,
            status: 'pendente'
          },
          raw: true
        });
        if (movimentacoes.length === 0) {
          const financeiro = await Financeiro.findByPk(movimentacao.financeiro_id)
          financeiro.update({ status: 'liquidado' })
        }
      }

      return movimentacao;
    } catch (error) {
      console.error('Erro ao atualizar movimentação financeira:', error);
      throw new Error('Erro ao atualizar movimentação financeira');
    }
  }

  static async getLancamentoCompletoById(id) {
    try {
      // Busca o lançamento principal
      const lancamento = await Financeiro.findOne({
        where: { id, tipo: 'debito' },
        raw: true // Retorna um objeto JavaScript comum
      });

      if (!lancamento) {
        throw new Error('Lançamento financeiro não encontrado');
      }

      // Busca as parcelas relacionadas na tabela MovimentacaoFinanceira
      const parcelas = await MovimentacaoFinanceira.findAll({
        where: { financeiro_id: id },
        raw: true
      });

      // Verifica se há vínculo com uma NotaFiscal
      const notaFiscal = await NotaFiscal.findOne({
        where: { id: lancamento.nota_id },
        raw: true
      });

      // Busca a entidade relacionada (fornecedor, funcionário ou cliente)
      let entidade = null;
      let entidadeNome = null;

      if (lancamento.fornecedor_id) {
        entidade = await Fornecedores.findOne({ where: { id: lancamento.fornecedor_id }, raw: true });
        entidadeNome = 'fornecedor';
      } else if (lancamento.funcionario_id) {
        entidade = await Funcionarios.findOne({ where: { id: lancamento.funcionario_id }, raw: true });

        // Verifica se o funcionário tem um cliente associado
        if (entidade.cliente_id) {
          const cliente = await Clientes.findOne({ where: { id: entidade.cliente_id }, raw: true });
          entidade.cliente = cliente; // Adiciona o cliente ao objeto do funcionário
        }
        entidadeNome = 'funcionario';
      } else if (lancamento.cliente_id) {
        entidade = await Clientes.findOne({ where: { id: lancamento.cliente_id }, raw: true });
        entidadeNome = 'cliente';
      }

      // Retorna todos os dados consolidados
      return {
        ...lancamento,
        [entidadeNome]: entidade,
        parcelas: parcelas || [], // Retorna as parcelas ou um array vazio se não houver
        notaFiscal: notaFiscal || null // Retorna a nota fiscal ou null se não houver
      };
    } catch (error) {
      console.error('Erro ao buscar lançamento:', error);
      throw new Error('Erro ao buscar lançamento financeiro');
    }
  }

  static async updateLancamentoFinanceiro(id, dadosAtualizados) {
    try {
      const lancamento = await Financeiro.findByPk(id);

      if (!lancamento) {
        throw new Error('Lançamento financeiro não encontrado');
      }

      const parcelasPagas = await MovimentacaoFinanceira.findAll({
        where: {
          financeiro_id: id,
          status: 'liquidado'
        },
        raw: true
      });


      if (parcelasPagas.length > 0) {
        throw new Error('Lançamento financeiro com parcelas pagas');
      }

      // Verifica se há vínculo com uma NotaFiscal
      const notaFiscal = await NotaFiscal.findOne({
        where: { id: lancamento.nota_id },
        raw: true
      });

      if (notaFiscal) {
        throw new Error(`Lançamento financeiro Vinculado a Nota Fiscal: ${notaFiscal.nNF}`);
      }

      if (dadosAtualizados.status === 'cancelada') {
        dadosAtualizados.data_cancelamento = new Date().toISOString().split('T')[0];
      }

      const lancamentoAtualizado = await lancamento.update(dadosAtualizados);

      return lancamentoAtualizado;
    } catch (error) {
      console.error('Erro ao atualizar lançamento financeiro:', error);
      throw new Error(`Erro ao atualizar lançamento financeiro: ${error.message}`);
    }
  }


  static async getContaPagarSemana() {
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
      SELECT mf.*
      FROM dbgerencialceleiro.financeiro fi
      INNER JOIN dbgerencialceleiro.movimentacaofinanceira mf ON mf.financeiro_id = fi.id
      WHERE mf.vencimento BETWEEN :segundaFeira AND :domingo
      AND fi.tipo = 'debito'
      AND mf.status = 'pendente'
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

module.exports = FinanceiroService;
