const Produtos = require('../models/Produtos');
const Vendas = require("../models/Vendas");
const VendasItens = require('../models/VendasItens');
const MovimentacoesEstoque = require('../models/MovimentacoesEstoque');
const Pagamentos = require('../services/PagamentosService');
const Lancamentos = require('../services/LancamentosService');
const { generateNFCeXML } = require('../util/geraXML');
const NFCeXml = require('../models/NFCeXml');  // Importa o modelo da tabela NFCeXml
const xml2js = require('xml2js');




class VendasService {
    static async registraVenda(data) {
        console.log('Venda: ' + JSON.stringify(data));
        const itensVenda = data.products;
        let pagamentos = data.pagamentos;

        if (data.cliente_id === '') {
            data.cliente_id = 176;
        }

        const vendaRegistrada = await Vendas.create(data);

        pagamentos = pagamentos.map(pagamento => ({
            ...pagamento,
            venda_id: vendaRegistrada.id,
        }));

        Pagamentos.registraPagamento(pagamentos);

        // Mapeia os itens para associar com o ID da venda registrada
        const itensVendaRegistrada = itensVenda.map((item) => ({
            venda_id: vendaRegistrada.id, // ID da venda registrada
            produto_id: item.id,          // ID do produto vendido
            quantity: parseFloat(item.quantity).toFixed(3), // Quantidade do produto
            vlrVenda: item.total            // Preço do produto
        }));

        const itensVendidos = await VendasItens.bulkCreate(itensVendaRegistrada);

        // Registra a movimentação de estoque para cada produto vendido
        for (const produto of itensVendaRegistrada) {
            await MovimentacoesEstoque.create({
                produto_id: produto.produto_id,
                quantidade: produto.quantity, // Quantidade negativa para indicar saída
                tipo_movimentacao: 'saida',      // Tipo de movimentação
                venda_id: vendaRegistrada.id,    // ID da venda associada
                valor_unit: produto.vlrVenda,    // ID da venda associada
                data_movimentacao: new Date(),    // Data e hora atual
                status: 0
            });
        }

        // Gera o XML da NFC-e
        const xml = await generateNFCeXML(data);

        // Converte o XML para JSON
        const parser = new xml2js.Parser();
        const jsonResult = await parser.parseStringPromise(xml);

        // Acessa o nível nfeProc.protNFe.infProt.chNFe
        const nNF = jsonResult.nfeProc.NFe[0].infNFe[0].ide[0].nNF[0];
        const cNF = jsonResult.nfeProc.NFe[0].infNFe[0].ide[0].cNF[0];
        const chaveAcesso = jsonResult.nfeProc.protNFe[0].infProt[0].chNFe[0];

        console.log('Chave de Acesso: ' + chaveAcesso);

        // Salva o XML na tabela NFCeXml
        //const chaveAcesso = extractChaveAcessoFromXML(xml);  // Você pode criar uma função para extrair a chave de acesso do XML

        await NFCeXml.create({
            chaveAcesso: chaveAcesso,  // Chave de acesso da NFC-e
            nNF: nNF,                // Número da NFC-e
            cNF: cNF,                // Código numérico da NFC-e
            venda_id: vendaRegistrada.id, // ID da venda associada
            xml: xml,                  // XML gerado
            status: 'ANDAMENTO',      // Status inicial (se necessário)
        });

        // Retorna o XML gerado para o frontend
        return {
            venda: vendaRegistrada,
            xml
        };
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


    static async consultaVendasDetalhado() {
        try {
            // Busca todas as vendas com status ativo
            const vendas = await Vendas.findAll({
                where: { status: 0 }, // Status igual a 0 (ativo)
                order: [['id', 'DESC']] // Ordena pelo ID em ordem decrescente
            });

            // Iterar sobre cada venda para buscar as formas de pagamento e valores pagos
            const vendasDetalhadas = [];
            for (let venda of vendas) {
                // Busca as formas de pagamento relacionadas à venda
                const formasPagamento = await Pagamentos.consultaPagamentoPorVenda(venda.id);

                // Adiciona o desconto como um objeto dentro de formasPagamento
                const formasPagamentoComDesconto = [
                    ...formasPagamento.map(fp => ({
                        formaPagamento: fp.formaPagamento,
                        vlrPago: fp.vlrPago // Valor pago por tipo de pagamento
                    })),
                    venda.desconto > 0
                        ? {
                            formaPagamento: 'Desconto',
                            vlrPago: -venda.desconto // Desconto representado como valor negativo
                        }
                        : null // Ignora se não houver desconto
                ].filter(Boolean); // Remove valores nulos do array

                // Estrutura a venda detalhada
                vendasDetalhadas.push({
                    id: venda.id,
                    descricao: `Venda #${venda.id}`,
                    tipo: 'Venda', // Tipo da transação
                    valor: venda.valor_total, // Valor total da venda
                    desconto: venda.desconto || 0, // Desconto aplicado na venda
                    cliente: venda.cliente || 'Não Informado', // Cliente da venda
                    data: venda.dataVenda,
                    formasPagamento: formasPagamentoComDesconto // Formas de pagamento da venda
                });
            }

            // Busca os lançamentos
            const lancamentos = await Lancamentos.consultaLancamentos();

            // Processa os lançamentos ajustando valores para crédito/débito
            const lancamentosProcessados = lancamentos.map(lancamento => ({
                id: lancamento.id,
                descricao: lancamento.descricao,
                tipo: lancamento.tipo, // Ex.: 'crédito' ou 'débito'
                valor: lancamento.tipo === 'credito' ? lancamento.valor : -lancamento.valor, // Crédito positivo, débito negativo
                desconto: 0, // Não se aplica a lançamentos
                data: lancamento.dataLancamento
            }));

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
            throw new Error('Erro ao buscar todas as vendas detalhadas');
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
