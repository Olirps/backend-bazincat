const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db');
const { Mutex } = require('async-mutex');
const mutex = new Mutex();
const NotaFiscal = require('../models/NotaFiscal');
const { dividirNotaFiscal } = require('../util/importaNotaFiscal');
const Fornecedores = require('../models/Fornecedores');
const Produtos = require('../models/Produtos');
const PagamentosNF = require('../models/PagamentosNF');
const ProdutosService = require('../services/ProdutosService');
const FornecedoresService = require('../services/FornecedoresService');
const getInformacoesProduto = require("../util/informacoesProduto");
const MovimentacoesEstoque = require("../models/MovimentacoesEstoque");
const ItensNaoIdentificados = require("../models/ItensNaoIdentificados");
const Financeiro = require('../models/Financeiro');

const { Op } = require('sequelize');

const fornecedoresCriados = [];
let fornecedorCreated;

class NotaFiscalService {
  static async criarNotaFiscal(xmlData, quantidadeNf) {
    //const transaction = await sequelize.transaction();

    try {

      const notasFiscais = xmlData.nfeProc.NFe;
      const jsonEntrada = notasFiscais.length;
      const dadosXml = await dividirNotaFiscal(xmlData);

      // Verifica se o fornecedor já existe
      let fornecedor;
      await mutex.runExclusive(async () => {
        fornecedor = await Fornecedores.findOne({ where: { cpfCnpj: dadosXml.fornecedor.CNPJ } });

        if (!fornecedor) {
          const originalJson = dadosXml.fornecedor;
          const mapping = {
            "CNPJ": "cpfCnpj",
            "xNome": "nome",
            "xFant": "nomeFantasia",
            "xLgr": "logradouro",
            "nro": "numero",
            "xBairro": "bairro",
            "xMun": "municipio",
            "cMun": "codMunIBGE",
            "UF": "uf",
            "CEP": "cep",
            "fone": "celular"
          };

          const normalizedJson = normalizeJson(flattenJson(originalJson), mapping);

          fornecedorCreated = await FornecedoresService.criarFornecedores(normalizedJson);
          adicionarFornecedor(fornecedorCreated.cpfCnpj);
          dadosXml.codFornecedor = fornecedorCreated.id;
        } else {
          dadosXml.codFornecedor = fornecedor.id;
        }
      });

      // Verifica se a nota fiscal já existe
      const notaFiscalExistente = await existeNF(dadosXml.informacoesIde.nNF, dadosXml.codFornecedor,);
      if (notaFiscalExistente) {
        throw new Error('Nota Fiscal Já Cadastrada.');
      }

      const dadosXMLAntes = dadosXml;
      console.log('Dados XML: ' + JSON.stringify(dadosXml));
      // Cria contas a pagar
      const contasPagarData = {
        descricao: `Nota Fiscal ${dadosXml.informacoesIde.nNF} - ${dadosXml.fornecedor.xFant}`,
        tipo: 'débito',
        tipo_lancamento: 'automatico',
        fornecedor_id: dadosXml.codFornecedor,
        valor: dadosXml.informacoesIde.vNF,
        data_lancamento: new Date(new Date().setHours(new Date().getHours() - 4)).toISOString().slice(0, 19).replace('T', ' '),
        status: 'aberta'
      };

      const financeiro = await Financeiro.create(contasPagarData);

      // Cria a nota fiscal
      let jsonCreateNF = dadosXml.informacoesIde;
      jsonCreateNF.codFornecedor = dadosXml.codFornecedor;
      jsonCreateNF.lancto = 'automatico';
      jsonCreateNF.status = 'fechada';
      jsonCreateNF.financeiro_id = financeiro.id;

      const nfCreated = await NotaFiscal.create(jsonCreateNF);
      // Processa produtos associados

      const pagamentosnf = { nota_id: nfCreated.id, ...dadosXml.pagamento }

      // Transformando para um objeto único
      const transformedData = {
        nota_id: nfCreated.id,
        ...pagamentosnf.detPag,
        ...pagamentosnf.detPag.card,
        ...pagamentosnf.vTroco,
        ...pagamentosnf.tPag
      };

      const pagamentos = Object.keys(pagamentosnf.detPag)
        .filter(key => !isNaN(key)) // Filtra apenas as chaves numéricas
        .map(key => ({
          ...pagamentosnf.detPag[key], // Pega os dados do pagamento
          nota_id: nfCreated.id, // Adiciona o ID da nota
        }));

      if (pagamentos.length > 0) {
        for (const data of pagamentos) {
          await PagamentosNF.create(data);
        }
      } else {
        await PagamentosNF.create(transformedData); // Caso não haja pagamentos, ainda cria um registro
      }


      //const cadastrapg = await PagamentosNF.create(transformedData)

      let produtoInfo = getInformacoesProduto(xmlData);

      if (produtoInfo && typeof produtoInfo === 'object') {
        produtoInfo.forEach(produto => {
          produto.nota_id = nfCreated.id;
        });
      } else {
        console.error('Erro: produtoInfo não é um objeto válido.');
      }

      await verificarProdutos(produtoInfo);

      return nfCreated;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async criarNotaFiscalManual(dados) {
    try {
      const notaFiscalExistente = await existeNF(dados.nNF, dados.codFornecedor);
      if (notaFiscalExistente) {
        throw new Error('Nota Fiscal Já Cadastrada.');
      }

      const fornecedor = await Fornecedores.findOne({ where: { id: dados.codFornecedor } });

      // Cria contas a pagar
      const contasPagarData = {
        descricao: `Nota Fiscal ${dados.nNF} - ${fornecedor.nomeFantasia}`,
        tipo: 'débito',
        tipo_lancamento: 'automatico',
        fornecedor_id: dados.codFornecedor,
        valor: dados.vNF,
        data_lancamento: new Date(new Date().setHours(new Date().getHours() - 4)).toISOString().slice(0, 19).replace('T', ' '),
        status: 'aberta'
      };

      const financeiro = await Financeiro.create(contasPagarData);

      dados.lancto = 'manual';
      dados.status = 'aberta';
      dados.dhEmi = dados.dataEmissao;
      dados.dhSaiEnt = dados.dataSaida;
      dados.financeiro_id = financeiro.id;


      const nfCreated = await NotaFiscal.create(dados);



      //await transaction.commit();
      return nfCreated;
    } catch (err) {
      //await transaction.rollback();
      throw new Error(err.message);
    }
  }

  // Métodos de CRUD para Nota Fiscal
  static async getAllNotasFiscais() {
    try {
      const notas = await NotaFiscal.findAll({
        where: {
          status: {
            [Op.notIn]: ['cancelada'] // Exclui registros com status "cancelada" ou "liquidado"
          }
        },
        order: [['id', 'DESC']]
      });

      for (let nota of notas) {
        const fornecedor = await Fornecedores.findOne({ where: { id: nota.codFornecedor } });
        nota.dataValues.cpfCnpj = fornecedor ? fornecedor.cpfCnpj : null;
        nota.dataValues.nomeFornecedor = fornecedor ? fornecedor.nome : null;
      }
      return notas;

    } catch (err) {
      throw new Error('Erro ao buscar todas as notas fiscais');
    }
  }

  static async getNotaFiscalById(id) {
    try {
      let notas = await NotaFiscal.findByPk(id);
      let notaEncontrada = notas;

      const fornecedor = await Fornecedores.findOne({ where: { id: notas.codFornecedor } });
      notas.dataValues.nomeFantasia = fornecedor ? fornecedor.nomeFantasia : null;
      notas.dataValues.nomeFornecedor = fornecedor ? fornecedor.nome : null;

      return notas;
    } catch (err) {
      throw new Error('Erro ao buscar a nota fiscal por ID');
    }
  }

  static async updateNotaFiscal(id, notaFiscalData) {
    try {
      const notaFiscal = await NotaFiscal.findByPk(id);
      if (!notaFiscal) {
        return null;
      }

      await notaFiscal.update(notaFiscalData);

      return notaFiscal
    } catch (err) {

      throw new Error(`Erro ao atualizar a nota fiscal: ${err.message}`);
    }
  }

  static async deleteNotaFiscal(id) {
    try {
      const notaFiscal = await NotaFiscal.findByPk(id);
      if (!notaFiscal) {
        return null;
      }
      await notaFiscal.destroy();
      return true;
    } catch (err) {
      throw new Error('Erro ao deletar a nota fiscal');
    }
  }
}

async function existeNF(nroNf, codFornecedor) {
  const exist = await NotaFiscal.findOne({
    where: { nNF: nroNf, codFornecedor: codFornecedor, status: { [Op.ne]: 'cancelada' } }
  });
  return !!exist;
}

async function verificarProdutos(produtosJSON) {
  for (let produto of produtosJSON) {
    const { cEAN, nome } = produto;
    const cEANNumber = parseInt(cEAN, 10);

    if (Number.isInteger(cEANNumber)) {
      try {
        const produtoEncontrado = await Produtos.findOne({
          where: { cEAN: cEAN }
        });

        if (produtoEncontrado) {
          produto.produto_id = produtoEncontrado.id;
          produto.tipo_movimentacao = 'entrada';
          produto.quantidade = produto.qCom;
          produto.valor_unit = produto.vUnCom;
          produto.status = 0;
          await MovimentacoesEstoque.create(produto);
        } else {
          let prodConsolidado = consolidarProdutosPorCEAN(produto)
          await ProdutosService.criarProduto(produto);
        }
      } catch (error) {
        console.error(`Erro ao buscar produto com cEAN ${cEAN}:`, error);
      }
    } else {
      await ItensNaoIdentificados.create(produto);
    }
  }
}

function flattenJson(json) {
  const flattenedJson = {};
  for (const key in json) {
    if (key !== 'endereco') {
      flattenedJson[key] = json[key];
    }
  }
  if (json.endereco) {
    for (const key in json.endereco) {
      flattenedJson[key] = json.endereco[key];
    }
  }
  return flattenedJson;
}

function normalizeJson(json, mapping) {
  const normalizedJson = {};
  for (const key in json) {
    if (Object.hasOwnProperty.call(json, key)) {
      const newKey = mapping[key] || key;
      normalizedJson[newKey] = json[key];
    }
  }
  return normalizedJson;
}

async function adicionarFornecedor(cnpj) {
  if (!fornecedoresCriados.includes(cnpj)) {
    fornecedoresCriados.push(cnpj);
  } else {
  }
  return fornecedoresCriados;
}


async function consolidarProdutosPorCEAN(produto) {
  const produtosConsolidados = {};

  const { cEAN, qCom, vProd } = produto;

  if (!produtosConsolidados[cEAN]) {
    produtosConsolidados[cEAN] = { qCom: 0, vProd: 0 };
  }

  produtosConsolidados[cEAN].qCom += qCom;
  produtosConsolidados[cEAN].vProd += vProd;

  return produtosConsolidados;
}

module.exports = NotaFiscalService;
