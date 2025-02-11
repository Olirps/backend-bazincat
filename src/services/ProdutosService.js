// src/services/ProdutosService.js
const Produtos = require('../models/Produtos');
const MovimentacoesEstoque = require("../models/MovimentacoesEstoque");
const ItensNaoIdentificados = require('../models/ItensNaoIdentificados');


class ProdutosService {
    // Cria um novo produto
    static async criarProduto(dadosProduto) {
        try {
            let produto = {};
            let prodOri_nf = 0;
            let qCom = 0;

            if (dadosProduto.produto_ori_id) {
                const itensNaoIdentificados = await ItensNaoIdentificados.findOne({
                    where: { id: dadosProduto.produto_ori_id }
                });
                prodOri_nf = itensNaoIdentificados.nota_id;
                qCom = itensNaoIdentificados.qCom;
                produto = await Produtos.create({
                    cProd: itensNaoIdentificados.cProd,
                    cEAN: itensNaoIdentificados.cEAN,
                    xProd: itensNaoIdentificados.xProd,
                    NCM: itensNaoIdentificados.NCM,
                    CFOP: itensNaoIdentificados.CFOP,
                    uCom: itensNaoIdentificados.uCom,
                    qCom: itensNaoIdentificados.qCom,
                    vUnCom: itensNaoIdentificados.vUnCom,
                    vProd: itensNaoIdentificados.vProd,
                    validade: itensNaoIdentificados.validade,
                    qtdMinima: itensNaoIdentificados.qtdMinima,
                    marca: itensNaoIdentificados.marca,
                    EXTIPI: itensNaoIdentificados.EXTIPI,
                    CEST: itensNaoIdentificados.CEST,
                    indEscala: itensNaoIdentificados.indEscala,
                    cEANTrib: itensNaoIdentificados.cEANTrib,
                    uTrib: itensNaoIdentificados.uTrib,
                    qTrib: itensNaoIdentificados.qTrib,
                    vUnTrib: itensNaoIdentificados.vUnTrib,
                    vDesc: itensNaoIdentificados.vDesc,
                    indTot: itensNaoIdentificados.indTot,
                    cProdANP: itensNaoIdentificados.cProdANP,
                    descANP: itensNaoIdentificados.descANP,
                    UFCons: itensNaoIdentificados.UFCons,
                    nBico: itensNaoIdentificados.nBico,
                    nTanque: itensNaoIdentificados.nTanque,
                    vEncIni: itensNaoIdentificados.vEncIni,
                    vEncFin: itensNaoIdentificados.vEncFin,
                    pBio: itensNaoIdentificados.pBio
                });

                if (prodOri_nf) {
                    dadosProduto.nota_id = prodOri_nf
                    dadosProduto.produto_id = produto.id;
                    dadosProduto.tipo_movimentacao = 'entrada'
                    dadosProduto.quantidade = qCom
                    dadosProduto.valor_unit = produto.vUnCom
                    dadosProduto.status = 0
                    const atualizaEstoque = MovimentacoesEstoque.create(dadosProduto);
                    const produto_mov = await ItensNaoIdentificados.findOne({
                        where: { id: dadosProduto.produto_ori_id }
                    });        // Criar movimentação de estoque com os mesmos dados
                    const atualizaitemnaoidentificado = await produto_mov.update({ produto_id: produto.id });
                }

            } else {
                if (dadosProduto.cod_interno) {
                    const produtoExistente = await Produtos.findOne({ where: { cod_interno: dadosProduto.cod_interno } });
                    if (produtoExistente && produtoExistente.id !== id) {
                        throw new Error(`Produto com código interno: ${dadosProduto.cod_interno} já cadastrado`);
                    }
                }
                if (dadosProduto.cEAN !== 'SEM GTIN' && dadosProduto.cEAN !== "") {
                    const produtoExistente = await Produtos.findOne({ where: { cEAN: dadosProduto.cEAN } });
                    if (produtoExistente) {
                        if (id != produtoExistente.id) {
                            throw new Error(`Produto: ${(dadosProduto.cEAN)} já cadastrado`);
                        }
                    }
                }
                let vlrVenda = Number(dadosProduto.vlrVenda);
                let vUnCom = Number(dadosProduto.vUnCom);
                dadosProduto.margemSobreVlrCusto = (vlrVenda / vUnCom) * 100;
                dadosProduto.margemSobreVlrCustoAtacado = (dadosProduto.vlrVendaAtacado / vUnCom) * 100;

                produto = await Produtos.create(dadosProduto);

                if (dadosProduto.nota_id) {
                    dadosProduto.produto_id = produto.id;
                    dadosProduto.tipo_movimentacao = 'entrada'
                    dadosProduto.quantidade = dadosProduto.qCom
                    dadosProduto.status = 0
                    dadosProduto.valor_unit = dadosProduto.vUnCom// dadosProduto.valor_unit ajustado ppara importacao de nf 24/09/2024

                    const atualizaEstoque = await MovimentacoesEstoque.create(dadosProduto);
                }
            }

            return produto;
        } catch (error) {
            throw new Error('Erro ao criar o produto: ' + error.message);
        }
    }

    // Obtém todos os produtos
    static async listarProdutos(filtro) {
        try {
            //console.log('Entrou FindAll Produtos: '+ JSON.stringify(filtro));
            return await Produtos.findAll({ where: filtro });
        } catch (error) {
            throw new Error('Erro ao listar os produtos: ' + error.message);
        }
    }

    // Obtém um produto por ID
    static async obterProdutoPorId(id) {
        try {
            const produto = await Produtos.findByPk(id);
            if (!produto) {
                throw new Error('Produto não encontrado');
            }
            return produto;
        } catch (error) {
            throw new Error('Erro ao obter o produto: ' + error.message);
        }
    }

    // Atualiza um produto por ID
    static async atualizarProduto(id, dadosAtualizados) {
        try {

            const produto = await Produtos.findByPk(id);

            if (!produto) {
                throw new Error('Produto não encontrado');
            }

            if (dadosAtualizados.cod_interno) {
                const produtoExistente = await Produtos.findOne({ where: { cod_interno: dadosAtualizados.cod_interno } });
                if (produtoExistente) {
                    if (Number(produtoExistente.id) !== Number(id)) {
                        throw new Error(`Produto com código interno: ${dadosAtualizados.cod_interno} já cadastrado`);
                    }
                }
            }
            if (dadosAtualizados.cEAN !== 'SEM GTIN' && dadosAtualizados.cEAN !== "") {
                const produtoExistente = await Produtos.findOne({ where: { cEAN: dadosAtualizados.cEAN } });
                if (produtoExistente) {
                    if (Number(produtoExistente.id) !== Number(id)) {
                        throw new Error(`Produto: ${(dadosAtualizados.cEAN)} já cadastrado`);
                    }
                }
            }

            let vlrVenda = Number(dadosAtualizados.vlrVenda);
            let vUnCom = Number(dadosAtualizados.vUnCom);
            dadosAtualizados.margemSobreVlrCusto = (vlrVenda / vUnCom) * 100;
            dadosAtualizados.margemSobreVlrCustoAtacado = (dadosAtualizados.vlrVendaAtacado / vUnCom) * 100;

            console.log('Dados para UPDATE: ' + JSON.stringify(dadosAtualizados));

            await produto.update(dadosAtualizados);
            return produto;
        } catch (error) {
            throw new Error('Erro ao atualizar o produto: ' + error.message);
        }
    }

    // Exclui um produto por ID
    static async excluirProduto(id) {
        try {
            const produto = await Produtos.findByPk(id);
            if (!produto) {
                throw new Error('Produto não encontrado');
            }
            await produto.destroy();
            return { mensagem: 'Produto excluído com sucesso' };
        } catch (error) {
            throw new Error('Erro ao excluir o produto: ' + error.message);
        }
    }

}

// Função para filtrar campos não presentes no modelo
function filterValidAttributes(model, data) {
    const validFields = Object.keys(model.rawAttributes); // Pega os campos definidos no modelo
    return Object.fromEntries(
        Object.entries(data).filter(([key]) => validFields.includes(key))
    );
}

module.exports = ProdutosService;
