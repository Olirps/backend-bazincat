const OSService = require('../models/os_service');
const OSFuncionarios = require('../models/OSFuncionarios');
const OSProdutosServicos = require('../models/os_produtos-servicos');
const VwOsService = require('../models/VWOsService');
const OsCompleta = require('../models/OsCompleta');
const OSWorkflow = require('../models/OSWorkflow');
const os_status = require('../models/os_status');
const OSWorkflowService = require('../services/OSWorkflowService');

const { dataAtual } = require('../util/util');
const { login } = require('../controllers/LoginController');

class OSServiceService {

    static async getAllOSService() {
        try {
            const os = await VwOsService.findAll(
                {
                    order: [['id', 'DESC']]
                }
            );

            return os;
        } catch (error) {
            throw new Error(`Erro ao buscar ordens de serviço: ${error.message}`);
        }
    }

    static async getOSServiceById(id) {
        try {
            const os = await OsCompleta.findOne({
                where: { id: id },
            });

            console.log('Dados OS Completa: ' + JSON.stringify(os));

            if (os) {
                // Converter campos JSON para objetos
                os.funcionarios = os.funcionarios || [];
                os.produtos_servicos = os.produtos_servicos || [];
            }

            return os;
        } catch (error) {
            console.error('Erro ao buscar O.S.:', error);
            throw error;
        }
    }

    static async createOSService(osServiceData) {
        try {
            // 04-04-2025 Alterei para valor_total para ficar igual nas rotinas de venda e O.S., alterado tbm SalesModal linha 167
            // 07-04-2025 alterei de osServiceData.valor_total para osServiceData.totalPrice
            const osCreate = {
                cliente_id: osServiceData.cliente_id,
                status_id: osServiceData.status_id,
                veiculo_id: osServiceData.veiculo_id || null,
                data_criacao: osServiceData.data_criacao,
                data_aprovacao: osServiceData.status_id == 2 ? dataAtual() : null,
                valor_total: osServiceData.totalPrice
            }

            const novaOSService = await OSService.create(osCreate);

            const status_nome = await os_status.findByPk(novaOSService.status_id);
            if (osServiceData.status_id == 2) {

                const status_id = 1;
                const status_nome = 'Aguardando Aprovação';
                const login = osServiceData.login;

                const work = await OSWorkflowService.registrarMudanca(novaOSService.id, status_id, status_nome, login);
            } else if (osServiceData.status_id == 3) {
                let status_id = 1;
                let status_nome = 'Aguardando Aprovação';
                let login = osServiceData.login;
                let work = await OSWorkflowService.registrarMudanca(novaOSService.id, status_id, status_nome, login);

                status_id = 2;
                status_nome = 'Em Andamento';
                login = osServiceData.login;
                work = await OSWorkflowService.registrarMudanca(novaOSService.id, status_id, status_nome, login);
            }

            const work = await OSWorkflowService.registrarMudanca(novaOSService.id, novaOSService.status_id, status_nome.nome, osServiceData.login)

            if (novaOSService) {
                // 03-04-2025 alterei de produtos_servicos para produtosServicos 
                // 05-04-2025 alterei de produtosServicos para produtos_servicos  pois na SalesModal linha 171 estava enviando produtosServicos
                // 07-04-2025 alterado de osServiceData.produtos_servicos para osServiceData.products
                const produtos = osServiceData.products
                for (const produto of produtos) {

                    const prodServicos = {
                        os_id: novaOSService.id,
                        produto_servico_id: produto.id,
                        quantidade: produto.quantidade,
                        vlrVenda: produto.vlrVenda,
                        valorTotal: produto.valorTotal,
                        status_id: '1'
                    }

                    const produtoServico = await OSProdutosServicos.create(prodServicos);

                    if (produto.funcionario_id) {
                        const funcionario = {
                            os_id: novaOSService.id,
                            funcionario_id: produto.funcionario_id,
                            servico_id: produtoServico.id
                        }
                        const os_funcionario = await OSFuncionarios.create(funcionario);
                        console.log('Funcionario Vinculado: ' + os_funcionario.funcionario_id);
                    } else if (osServiceData.funcionarios) {
                        const funcionarios_resp = osServiceData.funcionarios
                        for (const func of funcionarios_resp) {
                            const funcionario = {
                                os_id: novaOSService.id,
                                funcionario_id: func.value,
                                servico_id: produtoServico.id
                            }
                            const os_funcionario = await OSFuncionarios.create(funcionario)
                        }
                    }


                    // 07-04-2025 alterado pois esta dentro do for e está criando um funcionario para cada produtoServico
                    /* 
                    if (osServiceData.funcionarios.length > 0) {
                        const funcionarios_resp = osServiceData.funcionarios
                        if (funcionarios_resp.length > 1) {
                            for (const func of funcionarios_resp) {
                                let funcionario;
                                if (func == produto.funcionario_id) {
                                    const funcionario = {
                                        os_id: id,
                                        funcionario_id: func,
                                        servico_id: prodServico_old.id ? prodServico_old.id : produtoServico.id
                                    }
                                    const os_funcionario = await OSFuncionarios.create(funcionario)
                                }
                            }
                        } else {

                            const criaFunc = await OSFuncionarios.findAll({
                                where: {
                                    funcionario_id: funcionarios_resp[0],
                                    os_id: novaOSService.id,
                                    servico_id: produtoServico.id
                                }
                            })
                            if (criaFunc.length == 0) {
                                const funcionario = {
                                    os_id: novaOSService.id,
                                    funcionario_id: funcionarios_resp,
                                    servico_id: produtoServico.id
                                }
                                const os_funcionario = await OSFuncionarios.create(funcionario);
                                console.log('Funcionario Vinculado: ' + os_funcionario);
                            }


                        }

                    }*/

                }
            }
            return novaOSService;
        } catch (error) {
            throw new Error(`Erro ao criar ordem de serviço: ${error.message}`);
        }
    }

    static async aprovarOS(id, dados) {
        try {
            const osService = await OSService.findOne({ where: { id } });
            if (!osService) {
                throw new Error('Ordem de serviço não encontrada');
            }
            dados.status_id = 2;
            const osAprovada = await osService.update(dados);
            const status_nome = await os_status.findByPk(dados.status_id);
            const work = await OSWorkflowService.registrarMudanca(id, osAprovada.status_id, status_nome.nome, dados.login)

            if (osAprovada) {
                const produtoServicos = await OSProdutosServicos.findAll(
                    {
                        where: {
                            os_id: id
                        }
                    }
                )
                for (const prodAp of produtoServicos) {
                    dados.produtosAprovados
                }
            }

            return osAprovada;
        } catch (error) {
            throw new Error(`Erro ao atualizar ordem de serviço: ${error.message}`);

        }
    }
    static async removerProdutoOS(id, osServiceData) {
        try {

            const produtoRemovido = await OSProdutosServicos.findByPk(id);
            if (!produtoRemovido) {
                throw new Error('Ordem de serviço não encontrada');
            }
            const osService = await OSService.findOne({ where: { id: produtoRemovido.os_id } });
            if (!osService) {
                throw new Error('Ordem de serviço não encontrada');
            } else if (osService) {
                const valorOs = osService.valor_total;
                const novoValorOs = Number(valorOs - produtoRemovido.valorTotal).toFixed(2);
                // Atualiza o valor total da ordem de serviço
                await osService.update({ valor_total: novoValorOs });
            }
            produtoRemovido.update({
                removido: 1,
                data_removido: dataAtual()
            })
            return produtoRemovido
        } catch (error) {
            throw new Error(`Erro ao atualizar ordem de serviço: ${error.message}`);

        }

    }

    static async updateOSService(id, osServiceData) {
        try {
            const osService = await OSService.findOne({ where: { id } });
            if (!osService) {
                throw new Error('Ordem de serviço não encontrada');
            }

            if (osServiceData.status_id != osService.status_id) {

                const status = await os_status.findByPk(osServiceData.status_id);
                const status_id = osServiceData.status_id;
                const status_nome = status.nome;
                const login = osServiceData.login;

                const work = await OSWorkflowService.registrarMudanca(id, status_id, status_nome, login);

            }

            if (osServiceData.veiculo_id) {
                const osService = await OSService.findOne({ where: { id } });
                if (osService.veiculo_id != osServiceData.veiculo_id) {
                    osService.update({ veiculo_id: osServiceData.veiculo_id })
                }
            }
            // 07-04-2025 de osServiceData.produtos_servicos para osServiceData.products
            const produtos = osServiceData.products;
            for (const produto of produtos) {

                const prodServicos = {
                    os_id: id,
                    produto_servico_id: produto.id,
                    quantidade: produto.quantidade,
                    vlrVenda: produto.vlrVenda,
                    status_id: osServiceData.status_id // Se necessário, substitua pelo status que você deseja
                };

                const prodServico_old = await OSProdutosServicos.findOne({
                    where: {
                        produto_servico_id: produto.id,
                        os_id: id
                    }
                });

                if (prodServico_old) {
                    // Compara os campos relevantes
                    const isQuantidadeDiferente = prodServico_old.quantidade != produto.quantidade;
                    const isVlrVendaDiferente = prodServico_old.vlrVenda != produto.vlrVenda;
                    const isStatusDiferente = prodServico_old.status_id != produto.status_id;

                    // Se algum campo for diferente, realiza o update
                    if (isQuantidadeDiferente || isVlrVendaDiferente || isStatusDiferente) {
                        await OSProdutosServicos.update(prodServicos, {
                            where: {
                                id: prodServico_old.id,
                                os_id: id
                            }
                        });
                        console.log(`Produto ${produto.id} atualizado.`);
                    } else {
                        console.log(`Produto ${produto.id} não precisa de atualização.`);
                    }
                } else {
                    // Se o produto/serviço não existir, cria um novo
                    await OSProdutosServicos.create(prodServicos);
                    console.log(`Produto ${produto.id} criado.`);
                }

                // Lógica para vincular funcionários
                if (osServiceData.funcionarios.length > 0) {
                    const funcionarios_resp = osServiceData.funcionarios;

                    for (const func of funcionarios_resp) {
                        const funcionarioExistente = await OSFuncionarios.findOne({
                            where: { funcionario_id: func, os_id: id }
                        });

                        if (!funcionarioExistente) {
                            const funcionario = {
                                os_id: id,
                                funcionario_id: func.value,
                                servico_id: prodServico_old ? prodServico_old.id : produto.id // Garante que o ID correto seja vinculado
                            };
                            const os_funcionario = await OSFuncionarios.create(funcionario);
                            console.log(`Funcionario Vinculado: ${os_funcionario.funcionario_id}`);
                        } else {
                            console.log(`Funcionario já vinculado: ${funcionarioExistente.funcionario_id}`);
                        }
                    }
                }
            }

            // Atualiza a ordem de serviço no final
            await osService.update({
                status_id: osServiceData.status_id || osService.status, // Exemplo de atualização do status
                valor_total: osServiceData.totalPrice
                // Adicione mais campos para atualização, se necessário
            });
            console.log(`Ordem de serviço ${id} atualizada.`);

            return osService;

        } catch (error) {
            throw new Error(`Erro ao atualizar ordem de serviço: ${error.message}`);
        }
    }


    static async deleteOSService(id, empresa_id) {
        try {
            const osService = await OSService.findOne({ where: { id, empresa_id } });
            if (!osService) {
                throw new Error('Ordem de serviço não encontrada');
            }
            await osService.destroy();
            return { message: 'Ordem de serviço excluída com sucesso' };
        } catch (error) {
            throw new Error(`Erro ao excluir ordem de serviço: ${error.message}`);
        }
    }
}

module.exports = OSServiceService;
