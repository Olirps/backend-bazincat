// src/services/MarcaService.js
const VinculoProdVeiculo = require('../models/VinculoProdVeiculo');
const Produtos = require('../models/Produtos');
const NotaFiscal = require('../models/NotaFiscal');
const Fornecedores = require('../models/Fornecedores');
const MovimentacoesEstoque = require('../models/MovimentacoesEstoque');
const Veiculos = require('../models/Veiculos');

class VinculoProdVeiculoService {

    static async criarVinculo(dados) {
        dados.status = 'fechado';
        /*const vinculoExistente = await VinculoProdVeiculo.findOne({
            where: {
                produto_id: dados.produto_id,
                veiculo_id: dados.veiculo_id,
                nota_id: dados.nota_id
            }
        });
        if (vinculoExistente) {
            throw new Error(`Veículo ${dados.modelo} Já Vinculado`);
        }*/
        try {

            // Buscar valor_unit do produto na MovimentacoesEstoque com base na nota e produto
            const movimentacao = await MovimentacoesEstoque.findOne({
                where: {
                    id: dados.movimentacao_id,
                    produto_id: dados.produto_id,
                    nota_id: dados.nota_id,
                    tipo_movimentacao: 'entrada'
                },
                attributes: ['valor_unit']
            });

            const movimenta_estoque = { tipo_movimentacao: 'saida', quantidade: dados.quantidade, valor_unit: movimentacao.valor_unit, produto_id: dados.produto_id, nota_id: dados.nota_id, status: '0' }
            const vinculaSaida = await MovimentacoesEstoque.create(movimenta_estoque)
            dados.movimentacaoestoque_id = vinculaSaida.id;


            return await VinculoProdVeiculo.create(dados);
        } catch (err) {
            throw new Error(err.message);
        }
    }

    static async obterTodasVinculos() {
        try {
            return await VinculoProdVeiculo.findAll();
        } catch (err) {
            throw new Error(err.message);
        }
    }

    static async obterVinculoPorId(id) {
        try {
            return await VinculoProdVeiculo.findByPk(id);
        } catch (err) {
            throw new Error(err.message);
        }
    }

    static async obterVinculoPorVeiculoId(veiculo_id) {
        const veiculo = await VinculoProdVeiculo.findOne({
            where: {
                veiculo_id: veiculo_id,
                nota_id 
                
            }
        });
        return veiculo;
    }

    static async getVinculoPorProdutoId(produto_id, nota_id) {
        try {
            return await VinculoProdVeiculo.findAll({ where: { produto_id : produto_id ,nota_id: nota_id } });
        } catch (err) {
            throw new Error(err.message);
        }
    }

    static async atualizarVinculo(id, dados) {
        try {
            const [updated] = await VinculoProdVeiculo.update(dados, {
                where: { id }
            });
            if (updated) {
                return await VinculoProdVeiculo.findByPk(id);
            }
            return null;
        } catch (err) {
            throw new Error(err.message);
        }
    }

    static async getVinculoProdVeiculoAll() {
        try {
            // Buscar todos os vínculos
            const vinculos = await VinculoProdVeiculo.findAll({
                order: [['id', 'DESC']] // Ordena em ordem decrescente pelo ID
            });

            // Iterar sobre os vínculos e buscar os dados adicionais
            for (const vinculo of vinculos) {
                // Buscar xProd do Produto
                const produto = await Produtos.findByPk(vinculo.produto_id, {
                    attributes: ['xProd']
                });

                // Buscar número da Nota Fiscal
                const notaFiscal = await NotaFiscal.findByPk(vinculo.nota_id, {
                    attributes: ['nNF', 'codFornecedor', 'dhEmi']
                });

                // Buscar dados do Veículo
                const veiculo = await Veiculos.findByPk(vinculo.veiculo_id, {
                    attributes: ['modelo', 'placa']
                });

                // Buscar valor_unit do produto na MovimentacoesEstoque com base na nota e produto
                const movimentacao = await MovimentacoesEstoque.findOne({
                    where: {
                        id: vinculo.movimentacaoestoque_id,
                        produto_id: vinculo.produto_id,
                        nota_id: vinculo.nota_id,
                        tipo_movimentacao: 'saida'
                    },
                    attributes: ['valor_unit']
                });

                // Buscar nome do forncecedor na Fornecedores com base na nota
                const fornecedor = await Fornecedores.findOne({
                    where: {
                        id: notaFiscal.codFornecedor
                    },
                    attributes: ['nome']
                });

                // Adicionar os dados extras ao vínculo
                vinculo.dataValues.xProd = produto ? produto.xProd : null;
                vinculo.dataValues.numeroNota = notaFiscal ? notaFiscal.nNF : null;
                vinculo.dataValues.dtaEmissaoNF = notaFiscal ? notaFiscal.dhEmi : null;
                vinculo.dataValues.nome = fornecedor ? fornecedor.nome : null;
                vinculo.dataValues.modeloVeiculo = veiculo ? veiculo.modelo : null;
                vinculo.dataValues.placaVeiculo = veiculo ? veiculo.placa : null;
                vinculo.dataValues.valorUnitario = movimentacao ? movimentacao.valor_unit : null;
            }

            return vinculos;
        } catch (err) {
            throw new Error(err.message);
        }
    }

}

module.exports = VinculoProdVeiculoService;
