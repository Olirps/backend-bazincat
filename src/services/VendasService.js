const sequelize = require('../db');
const Produtos = require('../models/Produtos');
const Vendas = require("../models/Vendas");
const Financeiro = require("../models/Financeiro");
const VendasItens = require('../models/VendasItens');
const MovimentacoesEstoque = require('../models/MovimentacoesEstoque');
const Pagamentos = require('../services/PagamentosService');
const Lancamentos = require('../services/LancamentosService');
const { generateNFCeXML } = require('../util/geraXML');
const { dataAtual } = require('../util/util');
const NFCeXml = require('../models/NFCeXml');  // Importa o modelo da tabela NFCeXml
const xml2js = require('xml2js');
const OSService = require('../models/os_service');
const OSWorkflow = require('../models/OSWorkflow');
const os_status = require('../models/os_status');
const { Op } = require('sequelize');
const Clientes = require('../models/Clientes');
const formasPagamento = require('../models/formasPagamento');




class VendasService {
    static async registraVenda(data) {
        try {
            console.log('Venda: ' + JSON.stringify(data));

            const itensVenda = data.products;
            let pagamentos = data.pagamentos;
            let itensVendaDireta = data.produtosServicos;

            if (data.cliente_id === '') {
                data.cliente_id = 176;
            }
            let vendaRegistrada;
            if (data.os_id) {

                // Prepara pagamentos
                pagamentos = pagamentos.map(pagamento => ({
                    ...pagamento,
                    formapgto_id: pagamento.forma,
                    os_id: data.os_id,
                }));
            } else {
                // Registra a venda principal
                vendaRegistrada = await Vendas.create(data);

                // Prepara pagamentos
                pagamentos = pagamentos.map(pagamento => ({
                    ...pagamento,
                    formapgto_id: pagamento.forma,
                    venda_id: vendaRegistrada.id,
                }));

                // Processa itens da venda
                let itensVendaRegistrada = [];
                try {
                    // 07-05-2025 equiparação dos IF itensVenda e itensVendaDireta
                    if (itensVenda) {
                        itensVendaRegistrada = itensVenda.map((item) => ({
                            venda_id: vendaRegistrada.id,
                            produto_id: item.id,
                            quantity: Number(item.quantidade).toFixed(3),
                            vlrVenda: item.valorTotal                            ,
                        }));
                    } else if (itensVendaDireta) {
                        itensVendaRegistrada = itensVendaDireta.map((item) => ({
                            venda_id: vendaRegistrada.id,
                            produto_id: item.id,
                            quantity: Number(item.quantidade).toFixed(3),
                            vlrVenda: item.valorTotal,
                        }));
                    } else {
                        itensVendaRegistrada = itensVenda.map((item) => ({
                            venda_id: vendaRegistrada.id,
                            produto_id: item.id,
                            quantity: parseFloat(item.quantity).toFixed(3),
                            vlrVenda: item.valorTotal
                        }));
                    }

                    await VendasItens.bulkCreate(itensVendaRegistrada);
                } catch (error) {
                    throw new Error(`Falha ao registrar itens da venda: ${error.message}`);
                }

                try {
                    for (const produto of itensVendaRegistrada) {
                        await MovimentacoesEstoque.create({
                            produto_id: produto.produto_id,
                            quantidade: produto.quantity,
                            tipo_movimentacao: 'saida',
                            venda_id: vendaRegistrada.id,
                            valor_unit: produto.vlrVenda || produto.valorTotal,
                            data_movimentacao: new Date(),
                            status: 0
                        });
                    }
                } catch (error) {
                    throw new Error(`Falha ao registrar movimentação de estoque: ${error.message}`);
                }

            }

            // Atualiza OS se necessário
            if (data.tipoVenda !== 'Venda') {
                const concluiOs = await OSService.findByPk(data.os_id);
                await concluiOs.update({
                    status_id: 3,
                    data_conclusao: data.data_conclusao
                });

                await OSWorkflow.create({
                    os_id: data.os_id,
                    status_id: 3,
                    status_nome: 'Concluída',
                    data_mudanca: data.data_conclusao,
                    login: data.login
                });
            }

            // Registra pagamentos
            await Pagamentos.registraPagamento(pagamentos);
            // Registra movimentações de estoque


            // Gera e registra NFC-e
            try {
                const xml = await generateNFCeXML(data);
                const parser = new xml2js.Parser();
                const jsonResult = await parser.parseStringPromise(xml);

                const nNF = jsonResult.nfeProc.NFe[0].infNFe[0].ide[0].nNF[0];
                const cNF = jsonResult.nfeProc.NFe[0].infNFe[0].ide[0].cNF[0];
                const chaveAcesso = jsonResult.nfeProc.protNFe[0].infProt[0].chNFe[0];

                await NFCeXml.create({
                    chaveAcesso,
                    nNF,
                    cNF,
                    venda_id: vendaRegistrada?.id ||data?.os_id ,
                    xml,
                    status: 'ANDAMENTO'
                });

                return {
                    venda: vendaRegistrada,
                    xml
                };
            } catch (error) {
                throw new Error(`Falha ao gerar NFC-e: ${error.message}`);
            }
        } catch (error) {
            console.error('Erro no registro de venda:', error);
            throw new Error(`Erro ao processar venda: ${error.message}`);
        }
    }

    static async addXMLAssinado(id, xmlAssinado) {
        try {
            const xmlString = JSON.stringify(xmlAssinado);
            const xmlClean = xmlString.replace(/\n|\t/g, '');

            const nfcexml = await NFCeXml.findOne({
                where: {
                    venda_id: id
                }
            });
            if (!nfcexml) {
                throw new Error('NFCeXml não encontrada');
            }

            const nfcexmlAtualizada = await NFCeXml.update(
                {
                    xml: xmlClean,
                    status: 'ASSINADA'
                },
                {
                    where: {
                        venda_id: id // Filtra pelo venda_id
                    }
                }
            );
            return nfcexmlAtualizada;
        } catch (error) {
            throw new Error('Error ao adicionar XML assinado: ' + error.message);
        }
    }

    static async consultaVendas() {
        try {
            // Filtra as vendas com status igual a 0 (ativo)
            const vendas = await Vendas.findAll({
                where: {
                    status: 0 // Status igual a 0 (ativo)
                },
                order: [['id', 'DESC']] // Ordena pelo ID em ordem decrescente
            });

            // Iterar sobre cada venda para buscar as formas de pagamento
            for (let venda of vendas) {
                // Busca as formas de pagamento relacionadas à venda
                const formasPagamento = await Pagamentos.consultaPagamentoPorVenda(venda.id);

                // Extrai apenas o campo formaPagamento
                venda.dataValues.formaPagamento = formasPagamento.map(fp => fp.formaPagamento);
            }

            // Busca os lançamentos
            const lancamentos = await Lancamentos.consultaLancamentos();

            // Processa os lançamentos ajustando valores para crédito/débito
            const lancamentosProcessados = lancamentos.map(lancamento => ({
                id: lancamento.id,
                descricao: lancamento.descricao,
                tipo: lancamento.tipo, // Ex.: 'crédito' ou 'débito'
                valor: lancamento.tipo === 'credito' ? lancamento.valor : -lancamento.valor, // Crédito positivo, débito negativo
                dataLancamento: lancamento.dataLancamento
            }));

            // Unifica as vendas e lançamentos em uma única lista
            const transacoesUnificadas = [
                ...vendas.map(venda => ({
                    id: venda.id,
                    descricao: 'Venda',
                    tipo: venda.formaPagamento, // Forma de pagamento da venda
                    desconto: venda.desconto, // Desconto aplicado na venda
                    totalQuantity: venda.totalQuantity, // Quantidade total de produtos
                    valor: venda.totalPrice, // Valor da venda
                    cliente: venda.cliente || 'Não Informado',
                    data: venda.dataVenda,
                })),
                ...lancamentosProcessados.map(lancamento => ({
                    id: lancamento.id,
                    descricao: lancamento.descricao,
                    tipo: lancamento.tipo, // Crédito ou Débito
                    valor: lancamento.valor,
                    desconto: 0, // Não se aplica a lançamentos
                    data: lancamento.dataLancamento,
                }))
            ];

            // Ordena as transações pela data de forma decrescente
            transacoesUnificadas.sort((a, b) => new Date(b.data) - new Date(a.data));

            // Retorna as transações unificadas
            return {
                transacoes: transacoesUnificadas
            };
        } catch (err) {
            throw new Error('Erro ao buscar todas as vendas');
        }
    }


    static async consultaVendasDetalhado(filters = {}) {
        try {
            let { dataInicio, dataFim, clienteNome, cpfCnpj } = filters;
            // Construir whereClause base
            let whereClause = {
                status: 0
            };

            if (clienteNome) {
                try {
                    const clientes = await Clientes.findAll({
                        where: {
                            nome: {
                                [Op.like]: `%${clienteNome}%`
                            }
                        }
                    });
                    if (clientes.length > 0) {
                        whereClause.cliente_id = { [Op.in]: clientes.map(cliente => cliente.id) };
                    } else {
                        whereClause.cliente = { [Op.like]: `%${clienteNome}%` }; // Ajuste para LIKE
                    }


                } catch (error) {
                    throw new Error('Erro ao buscar todas as vendas' + error.message);
                }
            }

            if (cpfCnpj) {
                try {
                    const cliente = await Clientes.findOne({
                        where: {
                            cpfCnpj: cpfCnpj.replace(/\D/g, '')
                        }
                    });
                    whereClause.cliente_id = cliente.id;
                } catch (error) {
                    throw new Error('Erro ao buscar todas as vendas');
                }

            }

            // Se não forem fornecidas datas, usa o dia atual
            if (!dataInicio && !dataFim && !clienteNome && !cpfCnpj) {
                const hoje = new Date();
                dataInicio = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')} 00:00:00`;
                dataFim = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')} 23:59:59`;

                whereClause.dataVenda = {
                    [Op.between]: [dataInicio, dataFim]
                };

            } else {
                // Formata as datas fornecidas para o padrão correto
                if (dataInicio && dataFim) {
                    if (dataInicio && !dataInicio.includes(' ')) {
                        dataInicio += ' 00:00:00';
                    }
                    if (dataFim && !dataFim.includes(' ')) {
                        dataFim += ' 23:59:59';
                    }
                    whereClause.dataVenda = {
                        [Op.between]: [dataInicio, dataFim]
                    };
                }
            }


            // Busca todas as vendas com status ativo
            const vendas = await Vendas.findAll({
                where: whereClause,
                // Status igual a 0 (ativo)
                order: [['id', 'DESC']] // Ordena pelo ID em ordem decrescente
            });

            // Iterar sobre cada venda para buscar as formas de pagamento e valores pagos
            const vendasDetalhadas = [];
            for (let venda of vendas) {
                // Busca os pagamentos relacionados à venda
                const pagamentos = await Pagamentos.consultaPagamentoPorVenda(venda.id);

                // Para cada pagamento, busca a forma de pagamento correspondente
                const formasComValor = await Promise.all(
                    pagamentos.map(async (pagamento) => {
                        const formaPgto = await formasPagamento.findByPk(pagamento.formapgto_id);
                        return {
                            formaPagamento: formaPgto.nome, // Supondo que o nome está em `descricao`
                            vlrPago: pagamento.vlrPago // Supondo que o valor está em `valor`
                        };
                    })
                );

                // Adiciona o desconto como um objeto dentro de formasPagamento
                const pagamentoComDesconto = [
                    ...formasComValor,
                    venda.desconto > 0
                        ? {
                            formaPagamento: 'Desconto',
                            vlrPago: -venda.desconto // Desconto como valor negativo
                        }
                        : null
                ].filter(Boolean); // Remove valores nulos

                // Estrutura a venda detalhada
                vendasDetalhadas.push({
                    id: venda.id,
                    descricao: `Venda #${venda.id}`,
                    tipo: 'Venda', // Tipo da transação
                    valor: venda.valor_total, // Valor total da venda
                    desconto: venda.desconto || 0, // Desconto aplicado na venda
                    cliente: venda.cliente || 'Não Informado', // Cliente da venda
                    data: venda.dataVenda,
                    formasPagamento: pagamentoComDesconto // Formas de pagamento da venda
                });
            }
            let lancamentosProcessados = [];
            if (clienteNome, cpfCnpj) {
                lancamentosProcessados = [];
            } else {
                // Busca os lançamentos
                const lancamentos = await Lancamentos.consultaLancamentos({ dataInicio, dataFim });

                // Processa os lançamentos ajustando valores para crédito/débito
                lancamentosProcessados = lancamentos.map(lancamento => ({
                    id: lancamento.id,
                    descricao: lancamento.descricao,
                    tipo: lancamento.tipo, // Ex.: 'crédito' ou 'débito'
                    valor: lancamento.tipo === 'credito' ? lancamento.valor : -lancamento.valor, // Crédito positivo, débito negativo
                    desconto: 0, // Não se aplica a lançamentos
                    data: lancamento.dataLancamento
                }));
            }


            // Unifica as vendas detalhadas e os lançamentos em uma única lista
            const transacoesUnificadas = [
                ...vendasDetalhadas,
                ...lancamentosProcessados
            ];

            // Ordena as transações pela data de forma decrescente
            transacoesUnificadas.sort((a, b) => new Date(b.data) - new Date(a.data));

            // Retorna as transações unificadas
            return {
                transacoes: transacoesUnificadas
            };
        } catch (err) {
            throw new Error('Erro ao buscar todas as vendas detalhadas' + err);
        }
    }




    static async consultaItensPorVenda(id) {
        try {
            // Busca os itens da venda
            let itensVenda = await VendasItens.findAll({
                where: {
                    venda_id: id
                },
                order: [['id', 'ASC']]
            });

            // Enriquecer os itens com o nome do produto (xProd)
            for (let item of itensVenda) {
                const produto = await Produtos.findByPk(item.produto_id);
                if (produto) {
                    item.dataValues.xProd = produto.xProd; // Adiciona o campo xProd ao item
                    item.dataValues.vlrUnitario = produto.vlrVenda; // Adiciona o campo xProd ao item
                }
            }

            return itensVenda;
        } catch (err) {
            throw new Error('Erro ao buscar itens por venda');
        }
    }

    static async consultaVendaPorId(id) {
        try {
            const venda = await Vendas.findByPk(id);
            if (!venda) {
                throw new Error('Venda não encontrada');
            }
            return venda;
        } catch (error) {
            throw new Error('Erro ao consultar venda: ' + error.message);
        }
    }

    static async cancelaVenda(id, dadosCancelamento) {
        try {
            const venda = await Vendas.findByPk(id);
            if (!venda) {
                throw new Error('Venda não encontrada');
            }
            dadosCancelamento.status = 1;
            const vendaCancelada = await venda.update(dadosCancelamento);
            return vendaCancelada;
        } catch (error) {
            throw new Error('Erro ao cancelar o venda: ' + error.message);
        }
    }


}


module.exports = VendasService;
