const NotaFiscal = require('../models/NotaFiscal');
const Financeiro = require('../models/Financeiro');
const Clientes = require('../models/Clientes');
const Fornecedores = require('../models/Fornecedores');
const Funcionarios = require('../models/Funcionarios');
const UnificaLancamento = require('../models/UnificaLancamento');
const VwFinanceiroDebito = require('../models/VwFinanceiroDebito');
const MovimentacaoFinanceira = require('../models/MovimentacaoFinanceira');
const { dataAtual } = require('../util/util');
const { Op, where } = require('sequelize');
const { Sequelize, QueryTypes } = require('sequelize');
const sequelize = require('../db');
const moment = require('moment'); // ou dayjs
const UnificarLancamento = require('../models/UnificaLancamento');





class FinanceiroService {
  static async createLancamentos(dadosFinanceiro) {
    try {

      // Verifica se há boletos na movimentação ou nas parcelas
      if (
        dadosFinanceiro.boleto ||
        (Array.isArray(dadosFinanceiro.parcelas) && dadosFinanceiro.lancarParcelas.some(parcela => parcela.boleto))
      ) {
        const boletos = [];

        // Adiciona o boleto da movimentação, se existir
        if (dadosFinanceiro.boleto) {
          boletos.push(dadosFinanceiro.boleto);
        }

        // Adiciona os boletos das parcelas, se existirem
        if (Array.isArray(dadosFinanceiro.lancarParcelas)) {
          for (const parcela of dadosFinanceiro.lancarParcelas) {
            if (parcela.boleto) {
              boletos.push(parcela.boleto);
            }
          }
        }

        // Verifica se há boletos repetidos na solicitação
        const boletosUnicos = [...new Set(boletos)];
        if (boletosUnicos.length !== boletos.length) {
          throw new Error('Existem boletos repetidos na solicitação.');
        }

        // Verifica se os boletos já estão vinculados a outras movimentações financeiras
        for (const boleto of boletos) {
          const movimentacaoExistente = await MovimentacaoFinanceira.findOne({
            where: { boleto }
          });

          if (movimentacaoExistente) {
            throw new Error(`Boleto ${boleto} já vinculado a outra movimentação financeira.`);
          }
        }
      }


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

      if (dadosFinanceiro.lanctoSelecionados) {
        const lanctoSelecionados = dadosFinanceiro.lanctoSelecionados;

        for (const id of lanctoSelecionados) {
          const lancto = await Financeiro.findByPk(id)
          try {
            const dataCancelamento = dataAtual();
            lancto.update({
              status: 'cancelada',
              data_cancelamento: dataCancelamento,
              motivo_cancelamento: 'Despesa Cancelada e Unificada na Despesa ID: ' + despesa.id
            })
          } catch (error) {
            throw new Error('Erro ao Unificar Lançamentos');
          }
        }

        if (despesa) {
          const notaLancto = await NotaFiscal.findAll(
            {
              where: {
                financeiro_id: {
                  [Op.in]: lanctoSelecionados
                }
              }
            }
          );
          for (const nota_id of notaLancto) {
            const nota = await NotaFiscal.findByPk(nota_id.id);
            let unificar = { nota_id: nota.id, financeiro_id_old: nota.financeiro_id, financeiro_id_new: despesa.id, status: 1 };
            try {
              const unificaLancto = await UnificaLancamento.create(unificar)
              nota.update({ financeiro_id: despesa.id });
            } catch (error) {
              throw new Error('Erro ao Unificar Lançamentos ' + error);
            }
          }
        }
      }


      if (dadosFinanceiro.pagamento === 'recorrente') {
        const movimentacao = {
          financeiro_id: despesa.id,
          valor_parcela: dadosFinanceiro.valor,
          vencimento: dadosFinanceiro.data_vencimento,
          descricao: `${dadosFinanceiro.descricao} - Parcela 1 / 1`,
          status: 'pendente',
          parcela: 1, // Parcela única
          boleto: dadosFinanceiro.boleto
        };
        await MovimentacaoFinanceira.create(movimentacao);
      } else if (dadosFinanceiro.pagamento === 'cotaunica') {
        const movimentacao = {
          financeiro_id: despesa.id,
          valor_parcela: dadosFinanceiro.valor,
          vencimento: dadosFinanceiro.data_vencimento,
          descricao: `${dadosFinanceiro.descricao} - Parcela 1 / 1`,
          status: 'pendente',
          parcela: 1, // Parcela única
          boleto: dadosFinanceiro.boleto
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
            parcela: 0, // Parcela de entrada
            boleto: dadosFinanceiro.boleto

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
            parcela: i + 1, // Número da parcela
            boleto: dadosFinanceiro.lancarParcelas[i].boleto, // Formata a data para YYYY-MM-DD

          };

          await MovimentacaoFinanceira.create(movimentacao);
        }

      }

      return despesa;
    } catch (error) {
      console.error('Erro ao registrar despesa:', error);
      throw new Error('Erro ao registrar despesa: ' + error);
    }
  }



  static async getAllLancamentosFinanceiroDespesa(filtros) {
    try {
      const {tipo} = filtros

      const whereCondition = {
        tipo: tipo,
        status: {
          [Op.notIn]: ['cancelada', 'liquidado','pago','estornado']
        }
      };

      if (filtros) {
        const { descricao, fornecedor, funcionario, cliente, dataInicio, dataFim, pagamento, boleto } = filtros;

        if (descricao) whereCondition.descricao = { [Op.like]: `%${descricao}%` };
        if (pagamento) whereCondition.pagamento = pagamento;

        // Filtro para Fornecedor
        if (fornecedor) {
          // Busca os fornecedores com base no nomeFantasia OU nome (busca parcial)
          const fornecedor_filtred = await Fornecedores.findAll({
            where: {
              [Op.or]: [ // Usa o operador [Op.or] para buscar em nomeFantasia OU nome
                {
                  nomeFantasia: {
                    [Op.like]: `%${fornecedor}%` // Busca parcial no campo `nomeFantasia`
                  }
                },
                {
                  nome: {
                    [Op.like]: `%${fornecedor}%` // Busca parcial no campo `nome`
                  }
                }
              ]
            },
            attributes: ['id'],
            raw: true
          });

          // Extrai os IDs dos fornecedores filtrados
          const idsFornecedores = fornecedor_filtred.map(fornecedor => fornecedor.id);

          // Cria um array para armazenar as condições OR
          const conditions = [];

          // Adiciona a condição de fornecedor_id, se houver IDs de fornecedores
          if (idsFornecedores.length > 0) {
            conditions.push({
              fornecedor_id: {
                [Op.in]: idsFornecedores // Filtra por IDs dos fornecedores encontrados
              }
            });
          }

          // Adiciona a condição de credor_nome
          conditions.push({
            credor_nome: {
              [Op.like]: `%${fornecedor}%` // Busca parcial no campo `credor_nome`
            }
          });

          // Adiciona as condições ao `whereCondition` usando o operador [Op.or]
          whereCondition[Op.or] = conditions;
        }
        // Filtro para funcionário
        if (funcionario) {
          // Busca os clientes com base no nome (busca parcial)
          const clientesFiltrados = await Clientes.findAll({
            where: {
              nome: {
                [Op.like]: `%${funcionario}%` // Busca parcial no campo `nome`
              }
            },
            attributes: ['id'],
            raw: true
          });

          // Extrai os IDs dos clientes filtrados
          const idsClientes = clientesFiltrados.map(cliente => cliente.id);

          if (idsClientes.length > 0) {
            // Busca os funcionários associados aos clientes filtrados
            const funcionariosFiltrados = await Funcionarios.findAll({
              where: {
                cliente_id: {
                  [Op.in]: idsClientes // Filtra por IDs dos clientes encontrados
                }
              },
              attributes: ['id'],
              raw: true
            });

            // Extrai os IDs dos funcionários filtrados
            const idsFuncionarios = funcionariosFiltrados.map(funcionario => funcionario.id);

            if (idsFuncionarios.length > 0) {
              // Adiciona a condição ao `whereCondition`
              whereCondition.funcionario_id = {
                [Op.in]: idsFuncionarios // Filtra por IDs dos funcionários encontrados
              };
            } else {
              // Caso nenhum funcionário seja encontrado, você pode optar por não retornar nada
              whereCondition.funcionario_id = null; // Ou outra lógica de sua escolha
            }
          } else {
            // Caso nenhum cliente seja encontrado, você pode optar por não retornar nada
            whereCondition.funcionario_id = null; // Ou outra lógica de sua escolha
          }
        }

        // Filtro para cliente
        if (cliente) {
          // Busca os clientes com base no nome (busca parcial)
          const clientesFiltrados = await Clientes.findAll({
            where: {
              nome: {
                [Op.like]: `%${cliente}%` // Busca parcial no campo `nome`
              }
            },
            attributes: ['id'],
            raw: true
          });

          // Extrai os IDs dos clientes filtrados
          const idsClientes = clientesFiltrados.map(cliente => cliente.id);

          if (idsClientes.length > 0) {
            // Adiciona a condição ao `whereCondition`
            whereCondition.cliente_id = {
              [Op.in]: idsClientes // Filtra por IDs dos clientes encontrados
            };
          } else {
            // Caso nenhum cliente seja encontrado, você pode optar por não retornar nada
            whereCondition.cliente_id = null; // Ou outra lógica de sua escolha
          }
        }


      }

      let financeiro = await Financeiro.findAll({
        where: whereCondition,
        raw: true,
        order: [['id', 'DESC']]
      });

      if (filtros?.dataInicio || filtros?.dataFim || filtros?.boleto) {
        // Ajustar para garantir que não há hora
        const dataInicio = filtros.dataInicio ? moment(filtros.dataInicio).startOf('day').format('YYYY-MM-DD') : null;
        const dataFim = filtros.dataFim ? moment(filtros.dataFim).endOf('day').format('YYYY-MM-DD') : null;

        const whereClause = {};

        // Filtro por data de vencimento
        if (filtros.dataInicio || filtros.dataFim) {
          whereClause.vencimento = {
            [Op.between]: [
              dataInicio ? new Date(dataInicio) : null,
              dataFim ? new Date(dataFim) : null
            ]
          };
        }

        // Filtro por boleto
        if (filtros.boleto) {
          whereClause.boleto = filtros.boleto;
        }

        const movimentacoes = await MovimentacaoFinanceira.findAll({
          where: whereClause,
          attributes: ['financeiro_id'],
          raw: true
        });

        const idsValidos = movimentacoes.map(mov => mov.financeiro_id);
        financeiro = financeiro.filter(lancamento => idsValidos.includes(lancamento.id));
      }

      const financeiroComDetalhes = await Promise.all(financeiro.map(async (lancamento) => {
        let entidade = null;
        let entidadeNome = null;

        if (lancamento.fornecedor_id) {
          entidade = await Fornecedores.findOne({ where: { id: lancamento.fornecedor_id }, raw: true });
          entidadeNome = 'fornecedor';
        } else if (lancamento.funcionario_id) {
          entidade = await Funcionarios.findOne({ where: { id: lancamento.funcionario_id }, raw: true });
          const cliente = await Clientes.findOne({ where: { id: entidade?.cliente_id }, attributes: ['nome'], raw: true });
          entidade = { ...entidade, nome: cliente?.nome || null };
          entidadeNome = 'funcionario';
        } else if (lancamento.cliente_id) {
          entidade = await Clientes.findOne({ where: { id: lancamento.cliente_id }, raw: true });
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

  static async getLancamentosParaUnificar(filters = {}) {
    try {
      const { credor_nome, credor_id, cpfCnpj } = filters;
      const whereMovimentacao = {};

      if (credor_nome) {
        whereMovimentacao.credor_nome = credor_nome
      }
      if (credor_id) {
        whereMovimentacao.status = credor_id;
      }
      if (cpfCnpj) {
        whereMovimentacao.cpfCnpj = cpfCnpj;
      }

      // Chama a função que retorna os lançamentos para unificação
      const lancamentos = await VwFinanceiroDebito.findAll({
        where: whereMovimentacao
      });
      return lancamentos; // Retorna os lançamentos encontrados
    } catch (error) {
      console.error('Erro ao buscar lançamentos para unificação:', error);
      throw new Error('Não foi possível buscar os lançamentos para unificação.'); // Lança o erro para ser tratado no chamador
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
        const qtdParcelaMovimentacao = dadosMovimentacao.parcelas.length;

        // Verifica se há boletos na movimentação ou nas parcelas
        if (
          dadosMovimentacao?.boleto ||
          (Array.isArray(dadosMovimentacao.parcelas) && dadosMovimentacao.parcelas.some(parcela => parcela.boleto))
        ) {
          const boletos = [];

          // Adiciona o boleto da movimentação, se existir
          if (dadosMovimentacao.boleto) {
            boletos.push(dadosMovimentacao.boleto);
          }

          // Adiciona os boletos das parcelas, se existirem
          if (Array.isArray(dadosMovimentacao.parcelas)) {
            for (const parcela of dadosMovimentacao.parcelas) {
              if (parcela.boleto) {
                boletos.push(parcela.boleto);
              }
            }
          }

          // Verifica se há boletos repetidos na solicitação
          const boletosUnicos = [...new Set(boletos)];
          if (boletosUnicos.length !== boletos.length) {
            throw new Error('Existem boletos repetidos na solicitação.');
          }

          // Verifica se os boletos já estão vinculados a outras movimentações financeiras
          for (const boleto of boletos) {
            const movimentacaoExistente = await MovimentacaoFinanceira.findOne({
              where: { boleto }
            });

            if (movimentacaoExistente) {
              throw new Error(`Boleto ${boleto} já vinculado a outra movimentação financeira.`);
            }
          }
        }

        const valorEntrada = parseFloat((dadosMovimentacao.valorEntrada || '0')); // Default to 0 if undefined
        const valorTotal = parseFloat(dadosMovimentacao.valor); // Valor total da despesa
        const valorRestante = valorTotal - valorEntrada; // Calcula o valor restante após a entrada
        const qtdParcelas = dadosMovimentacao.parcelas.length; // Número de parcelas
        const valorParcela = valorRestante / qtdParcelas; // Valor de cada parcela
        const valorParcelaArredondado = parseFloat(valorParcela.toFixed(2)); // Arredondamos para 2 casas decimais

        const dataVencimentoInicial = new Date(dadosMovimentacao.vencimento); // Data de vencimento da primeira parcela

        // Se houver valor de entrada, cria a parcela de entrada (parcela 0)
        if (valorEntrada > 0) {
          console.log('Dados Movimentacao: ' + JSON.stringify(dadosMovimentacao));
          const movimentacaoEntrada = {
            financeiro_id: dadosMovimentacao.financeiro_id,
            valor_parcela: valorEntrada,
            vencimento: dadosMovimentacao.vencimento, // A entrada vence na mesma data da primeira parcela
            descricao: `${dadosMovimentacao.descricao} - Entrada`,
            status: 'pendente',
            parcela: 0, // Parcela de entrada
            boleto: dadosMovimentacao.boleto
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
            valor_parcela: parseFloat(dadosMovimentacao.parcelas[i].valor.replace(/[^0-9,-]/g, '').replace(',', '.')),
            vencimento: dadosMovimentacao.parcelas[i].dataVencimento, // Formata a data para YYYY-MM-DD
            descricao: `${dadosMovimentacao.descricao} - Parcela ${i + 1} / ${qtdParcelas}`,
            status: 'pendente',
            parcela: i + 1, // Número da parcela
            boleto: dadosMovimentacao.parcelas[i].boleto
          };
          parcelas = await MovimentacaoFinanceira.create(movimentacao);
          if (parcelas) {
            const financeiro = await Financeiro.findByPk(dadosMovimentacao.financeiro_id);
            const status = { status: 'andamento' }
            await financeiro.update(status)
          }
        }
      } else {


        // Verifica se há boletos na movimentação ou nas parcelas
        if (
          dadosMovimentacao.boleto ||
          (Array.isArray(dadosMovimentacao.parcelas) && dadosMovimentacao.parcelas.some(parcela => parcela.boleto))
        ) {
          const boletos = [];

          // Adiciona o boleto da movimentação, se existir
          if (dadosMovimentacao.boleto) {
            boletos.push(dadosMovimentacao.boleto);
          }

          // Adiciona os boletos das parcelas, se existirem
          if (Array.isArray(dadosMovimentacao.parcelas)) {
            for (const parcela of dadosMovimentacao.parcelas) {
              if (parcela.boleto) {
                boletos.push(parcela.boleto);
              }
            }
          }

          // Verifica se há boletos repetidos na solicitação
          const boletosUnicos = [...new Set(boletos)];
          if (boletosUnicos.length !== boletos.length) {
            throw new Error('Existem boletos repetidos na solicitação.');
          }

          // Verifica se os boletos já estão vinculados a outras movimentações financeiras
          for (const boleto of boletos) {
            const movimentacaoExistente = await MovimentacaoFinanceira.findOne({
              where: { boleto }
            });

            if (movimentacaoExistente) {
              throw new Error(`Boleto ${boleto} já vinculado a outra movimentação financeira.`);
            }
          }
        }

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
            parcela: 0, // Parcela de entrada
            boleto: dadosMovimentacao.boleto
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
          descricao: dadosMovimentacao.descricao,
          boleto: dadosMovimentacao.parcelas[0].boleto
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
      throw new Error('Erro ao registrar movimentação financeira' + error);
    }
  }


  static async getMovimentacaoFinanceiraByFinanceiroID(financeiro_id, filtros) {
    try {
      const { dataInicio, dataFim } = filtros;
      let movimentacoes;
      if (filtros?.dataInicio || filtros?.dataFim) {
        // Ajustar para garantir que não há hora
        const dataInicio = filtros.dataInicio ? moment(filtros.dataInicio).startOf('day').format('YYYY-MM-DD') : null;
        const dataFim = filtros.dataFim ? moment(filtros.dataFim).endOf('day').format('YYYY-MM-DD') : null;

        movimentacoes = await MovimentacaoFinanceira.findAll({
          where: {
            financeiro_id,
            status: { [Op.notIn]: ['liquidado', 'cancelado'] }, // Correção aqui
            vencimento: {
              [Op.between]: [
                dataInicio ? new Date(dataInicio) : null,
                dataFim ? new Date(dataFim) : null,
              ]
            }
          },
          raw: true
        });
      } else {
        movimentacoes = await MovimentacaoFinanceira.findAll({
          where: {
            financeiro_id,
            status: 'pendente'
          },
          raw: true
        });
      }
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
          if (financeiro.pagamento === 'recorrente') {
            const novaDataVencimento = new Date(movimentacao.vencimento);
            novaDataVencimento.setMonth(novaDataVencimento.getMonth() + 1);
            const parcelas = await MovimentacaoFinanceira.create({
              descricao: movimentacao.descricao,
              parcela: Number(movimentacao.parcela) + 1,
              financeiro_id: movimentacao.financeiro_id,
              valor_parcela: movimentacao.valor_parcela,
              vencimento: novaDataVencimento,
              status: 'pendente'
            });
          } else {
            financeiro.update({ status: 'liquidado' })
          }
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
      const notaFiscal = await NotaFiscal.findAll({
        where: { financeiro_id: lancamento.id },
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

      if (dadosAtualizados.status === 'cancelada') {
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
        const notaFiscal = await NotaFiscal.findAll({
          where: { financeiro_id: lancamento.id },
          raw: true
        });

        if (notaFiscal.length > 0) {
          let lancamentoAtualizado;

          for (const nf of notaFiscal) {
            const notaRollBack = await UnificarLancamento.findOne(
              {
                where: {
                  nota_id: nf.id,
                  status: 1
                }
              }
            );
            if (notaRollBack) {
              const status = { status: 0 }
              const cancelaUnificacao = await notaRollBack.update(status);
              const notaFiscalRollBack = await NotaFiscal.findOne(
                {
                  where: {
                    id: notaRollBack.nota_id
                  }
                }
              );
              const financeiroRollBack = await Financeiro.findOne(
                {
                  where: {
                    id: notaRollBack.financeiro_id_old
                  }
                }
              );
              const voltarFinanceiro = { status: 'aberta', data_cancelamento: null, motivo_cancelamento: null };
              const voltarNota = { financeiro_id: notaRollBack.financeiro_id_old };

              const movimentacoes = await MovimentacaoFinanceira.findAll({
                where: {
                  financeiro_id: notaRollBack.financeiro_id_new,
                  status: { [Op.notIn]: ['cancelado'] } // Correção aqui
                }
              });


              for (const mov of movimentacoes) {
                const cancelamento = { status: 'cancelado', motivo_cancelamento: 'Cancelado pelo Usuário', data_cancelamento: dataAtual() };
                const movimentacoesFind = await MovimentacaoFinanceira.findByPk(mov.id)

                const cancela = await movimentacoesFind.update(cancelamento);
              }

              financeiroRollBack.update(voltarFinanceiro);
              notaFiscalRollBack.update(voltarNota);

              dadosAtualizados.data_cancelamento = dataAtual();
              dadosAtualizados.motivo_cancelamento = 'Lançamento Cancelado pelo Usuário';

              lancamentoAtualizado = await lancamento.update(dadosAtualizados);

            }
            else {
              dadosAtualizados.status = 'aberta';

              const movimentacoes = await MovimentacaoFinanceira.findAll({
                where: {
                  financeiro_id: lancamento.id,
                  status: { [Op.notIn]: ['cancelado'] } // Correção aqui
                }
              });


              for (const mov of movimentacoes) {
                const cancelamento = { status: 'cancelado', motivo_cancelamento: 'Cancelado pelo Usuário', data_cancelamento: dataAtual() };
                const movimentacoesFind = await MovimentacaoFinanceira.findByPk(mov.id)

                const cancela = await movimentacoesFind.update(cancelamento);
              }

              lancamentoAtualizado = await lancamento.update(dadosAtualizados);


            }
          }
          return lancamentoAtualizado;

        } else {
          dadosAtualizados.data_cancelamento = dataAtual();
          dadosAtualizados.motivo_cancelamento = 'Lançamento Cancelado pelo Usuário';

          const movimentacoes = await MovimentacaoFinanceira.findAll(
            {
              where:
                { financeiro_id: lancamento.id }
            }
          )

          for (const mov of movimentacoes) {
            const dataAtualNew = dataAtual();
            const cancelamento = { status: 'cancelado', motivo_cancelamento: 'Cancelado pelo Usuário', data_cancelamento: dataAtualNew };
            const movimentacoesFind = await MovimentacaoFinanceira.findByPk(mov.id)

            const cancela = await movimentacoesFind.update(cancelamento);
          }

          const lancamentoAtualizado = await lancamento.update(dadosAtualizados);

          return lancamentoAtualizado;

        }
      } else {
        const lancamento = await Financeiro.findByPk(id);
        const lancamentoAtualizado = await lancamento.update(dadosAtualizados);
        return lancamentoAtualizado
      }

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
      INNER JOIN dbgerencialceleiro.movimentacaofinanceira mf ON (mf.financeiro_id = fi.id and fi.status <> 'cancelada')
      WHERE mf.vencimento BETWEEN :segundaFeira AND :domingo
      AND fi.tipo = 'debito'
      AND mf.status = 'pendente'
      order by mf.vencimento asc
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
