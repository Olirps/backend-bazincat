const TipoTransacao = require('../models/TipoTransacao');
const StatusTransacao = require('../models/StatusTransacao');
const TefTransacao = require('../models/Tef_transacoes');

class TefService {
    static async criarTransacaoTEF(pagamento_id, venda_id, transacaoData) {
        try {
            // Buscar o Tipo de Transação
            const tipoTransacao = await TipoTransacao.findOne({ where: { descricao: transacaoData.tipo_transacao } });
            if (!tipoTransacao) throw new Error('Tipo de transação não encontrado');

            // Buscar o Status da Transação
            const statusTransacao = await StatusTransacao.findOne({ where: { descricao: 'Pendente' } });
            if (!statusTransacao) throw new Error('Status de transação não encontrado');

            // Criar a Transação TEF
            const transacao = await TefTransacao.create({
                pagamento_id,
                venda_id,
                transacao_id: transacaoData.transacao_id,
                nsu_sitef: transacaoData.nsu_sitef,
                data_hora: transacaoData.data_hora,
                valor: transacaoData.valor,
                bandeira_cartao: transacaoData.bandeira_cartao,
                tipo_transacao_id: tipoTransacao.id,
                status_id: statusTransacao.id,
                mensagem_retorno: transacaoData.mensagem_retorno,
                codigo_autorizacao: transacaoData.codigo_autorizacao,
                nsu_host: transacaoData.nsu_host,
                codigo_resposta: transacaoData.codigo_resposta,
                comprovante_cliente: transacaoData.comprovante_cliente,
                comprovante_loja: transacaoData.comprovante_loja,
            });

            return transacao;
        } catch (error) {
            throw new Error(`Erro ao criar transação TEF: ${error.message}`);
        }
    }
}

module.exports = TefService;
