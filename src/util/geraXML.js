const { dataAtual } = require("../util/util.js");
const NFCeXml = require('../models/NFCeXml.js');
const UF = require('../models/Uf');
const Municipio = require('../models/Municipio.js');
const Empresa = require('../models/Empresa.js');
const Clientes = require('../models/Clientes.js');

// Função para obter o último número da nota fiscal registrado
const getUltimoNumeroNota = async () => {
  const ultimoRegistro = await NFCeXml.findOne({
    order: [['id', 'DESC']], // Ordenar por id decrescente
    attributes: ['nNF'], // Pegar apenas o número da nota
  });
  return ultimoRegistro ? parseInt(ultimoRegistro.nNF, 10) : 0; // Retornar o último número ou 0 se não houver registros
};

async function gerarCNFUnico() {
  let cNF;

  // Buscar apenas a coluna 'cNF' do banco de dados
  const cNFsUtilizadosArray = await NFCeXml.findAll({
    attributes: ['cNF'],
    raw: true // Retorna os resultados como objetos planos
  });

  // Converter para um Set para facilitar a verificação de unicidade
  const cNFsUtilizados = new Set(cNFsUtilizadosArray.map(item => item.cNF));

  // Gerar um cNF único
  do {
    cNF = gerarCNF(); // Função que gera um novo CNF
  } while (cNFsUtilizados.has(cNF));

  return cNF;
}

// Função para gerar um CNF aleatório de 8 dígitos
function gerarCNF() {
  return Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
}

function calcularDV(chave43Digitos) {
  // Verifica se a chave tem exatamente 43 dígitos
  if (chave43Digitos.length !== 43 || !/^\d+$/.test(chave43Digitos)) {
    throw new Error("A chave deve conter exatamente 43 dígitos numéricos.");
  }

  // Pesos do Módulo 11 (de 2 a 9, da direita para a esquerda)
  const pesos = [4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  // Calcula a soma dos produtos dos dígitos pelos pesos
  let soma = 0;
  for (let i = 0; i < 43; i++) {
    soma += parseInt(chave43Digitos[i]) * pesos[i];
  }

  // Calcula o resto da divisão por 11
  const resto = soma % 11;

  // Determina o DV
  const dv = (resto === 0 || resto === 1) ? 0 : 11 - resto;

  return dv;
}

const generateChaveAcesso = async (data) => {

  let empresa = data.empresa;

  if (!empresa) {
    empresa = await Empresa.findOne({
      where: {
        status: 1
      }
    })
  }
  // Obter o último número da nota fiscal e somar 1
  const numeroNota = (await getUltimoNumeroNota()) + 1;

  // Ajustando para garantir que o número da nota tenha 9 dígitos
  const numeroNotaStr = numeroNota.toString().padStart(9, '0');

  const codigoUF = empresa.uf_id;  // Código da UF (2 dígitos)
  const ano = data.dataVenda.substring(2, 4);  // '25'
  const mes = data.dataVenda.substring(5, 7);  // '03'
  const cnpj = empresa.cnpj.replace(/[^\d]/g, '').padStart(14, '0');  // CNPJ do emitente (14 dígitos)
  const modelo = 65; //Modelo NFC-e Sempre será 65
  const serie = '001';  // Serie definido pela empresa
  const tpEmis = 1;  // Serie definido pela empresa
  const cNF = data.cNF;

  // Número aleatório de 8 dígitos

  // Monta os 43 dígitos da chave de acesso (sem o DV)
  const chave43Digitos = `${codigoUF}${ano}${mes}${cnpj}${modelo}${serie}${numeroNotaStr}${tpEmis}${cNF}`;

  // Calcula o Dígito Verificador (DV)
  const dv = calcularDV(chave43Digitos);

  // Concatena o DV para formar a chave de acesso completa (44 dígitos)
  const chaveAcesso = `${chave43Digitos}${dv}`;

  // Concatenar os dados na ordem correta
  // const chaveAcesso = `${codigoUF}${ano}${mes}${cnpj}${modelo}${serie}${numeroNotaStr}${tpEmis}${cNF}`;

  return chaveAcesso;
};


const generateNFCeXML = async (data) => {
  let empresa = data.empresa;
  const cliente = data.cliente;
  if (!empresa) {
    empresa = await Empresa.findOne({
      where: {
        status: 1
      }
    })
  }
  let produtos = []
  if (data.produtosServicos && Array.isArray(data.produtosServicos) && data.produtosServicos.length > 0) {
    produtos = data.produtosServicos;
  } else {
    produtos = data.products;
  }

  const pagamentos = data.pagamentos;
  const totalQuantity = data.totalQuantity;
  const totalPrice = data.totalPrice;
  const desconto = data.desconto;
  const dataVenda = dataAtual();
  const cNF = await gerarCNFUnico();
  data.cNF = cNF;

  const municipio = await Municipio.findByPk(empresa.municipio_id);
  const uf = await UF.findOne(
    {
      where: {
        codIBGE: empresa.uf_id
      }
    }
  );
  // Exemplo de como gerar a chave de acesso
  const chaveAcesso = await generateChaveAcesso(data);
  const numeroNota = (await getUltimoNumeroNota()) + 1;
  const cDV = calcularDV(chaveAcesso.substring(0, 43));

  // Convertendo para o formato correto (ISO com fuso horário -03:00)
  const dataObj = new Date(dataVenda.replace(" ", "T") + "-03:00");

  // Formatar para o formato esperado
  // Ajustando a data para não alterar com base no horário local
  const dataconvertida = dataObj.toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';


  // Cabeçalho da NFC-e (ide)
  const ide = `  
      <ide>
        <cUF>${empresa.uf_id}</cUF> 
        <cNF>${cNF}</cNF>
        <natOp>VENDA DE MERCADORIA CONFORME CFOP</natOp>
        <mod>65</mod> 
        <serie>1</serie> 
        <nNF>${numeroNota}</nNF> 
        <dhEmi>${dataconvertida}</dhEmi>
        <tpNF>1</tpNF>
        <idDest>1</idDest>
        <cMunFG>${municipio.codMunIBGE}</cMunFG>
        <tpImp>5</tpImp>
        <tpEmis>1</tpEmis>
        <cDV>${cDV}</cDV>
        <tpAmb>2</tpAmb> 
        <finNFe>1</finNFe>
        <indFinal>1</indFinal>
        <indPres>1</indPres>
        <indIntermed>0</indIntermed>
        <procEmi>0</procEmi>
        <verProc>1.0</verProc>
      </ide>
    `;


  // Emitente (empresa)
  const emit = `  
      <emit>
        <CNPJ>${empresa.cnpj.replace(/\D/g, '')}</CNPJ>
        <xNome>${empresa.razaosocial}</xNome>
        <xFant>${empresa.nome}</xFant>
        <enderEmit>
            <xLgr>${empresa.logradouro || ''}</xLgr>
            <nro>${empresa.numero || ''}</nro>
            <xBairro>${empresa.bairro || ''}</xBairro>
            <cMun>${municipio.codMunIBGE}</cMun>
            <xMun>${municipio.nome}</xMun>
            <UF>${uf.sigla}</UF>
            <CEP>${empresa.cep.replace('-', '')}</CEP>
            <cPais>1058</cPais>
            <xPais>BRASIL</xPais>
            <fone>${empresa.telefone.replace(/\D/g, '' || '')}</fone>
        </enderEmit>
        <IE>${empresa.inscricao_estadual || 'ISENTO'}</IE>
        <CRT>${empresa.regime_tributario}</CRT>
      </emit>
    `;

  let dest = '';


  // Destinatário (cliente)
  if (data.cliente_id) {
    const cliente = await Clientes.findByPk(data.cliente_id);
    const municipioCliente = await Municipio.findByPk(cliente.municipio_id);

    const ufCliente = await UF.findOne(
      {
        where: {
          codIBGE: cliente.uf_id
        }
      }
    );

    // Monta o bloco enderDest apenas se o cliente tiver logradouro
    let enderDest = '';
    if (cliente.logradouro) {
      enderDest = `
            <enderDest>
                <xLgr>${cliente.logradouro || ''}</xLgr>
                <nro>${cliente.numero || ''}</nro>
                <xBairro>${cliente.bairro || ''}</xBairro>
                <cMun>${municipioCliente.codMunIBGE || ''}</cMun>
                <xMun>${municipioCliente.nome || ''}</xMun>
                <UF>${ufCliente.sigla || ''}</UF>
                <CEP>${cliente.cep.replace('-', '') || ''}</CEP>
                <cPais>1058</cPais>
                <xPais>BRASIL</xPais>
                <fone>${cliente.celular.replace(/\D/g, '') || ''}</fone>
            </enderDest>
        `;
    }

    let indIEDest = 9; // Default: Não contribuinte (Pessoa Física)

    // Se for Pessoa Jurídica (CNPJ)
    if (cliente.cpfCnpj.replace(/\D/g, '').length > 11) {
      if (cliente.inscricao_estadual) {
        indIEDest = 1; // Contribuinte do ICMS
      } else {
        indIEDest = 2; // Isento de IE
      }

      dest = `
                <dest>
                    <CNPJ>${cliente.cpfCnpj.replace(/\D/g, '')}</CNPJ> 
                    <xNome>${cliente.nome}</xNome>
                    ${cliente.logradouro ? enderDest : ''} <!-- Inclui enderDest apenas se existir logradouro -->
                    <indIEDest>${indIEDest}</indIEDest>
                    ${cliente.inscricao_estadual ? `<IE>${cliente.inscricao_estadual}</IE>` : ''}
                </dest>
            `;
    } else {
      // Pessoa Física (CPF)
      dest = `
                <dest>
                    <CPF>${cliente.cpfCnpj.replace(/\D/g, '')}</CPF> 
                    <xNome>${cliente.nome}</xNome>
                    ${cliente.logradouro ? enderDest : ''} <!-- Inclui enderDest apenas se existir logradouro -->
                    <indIEDest>9</indIEDest> <!-- Pessoa Física sempre não contribuinte -->
                </dest>
            `;
    }
  }

  // Produtos (det)
  let det = '';
  let totalICMS = 0;

  produtos.forEach((produto, index) => {
    const valorICMS = produto.total * (empresa.icms_aliquota / 100);

    det += `  
        <det nItem="${index + 1}">
          <prod>
            <cProd>${produto.cod_interno || '00000'}</cProd>
            <cEAN>${produto.cEAN || 'SEM GTIN'}</cEAN>
            <xProd>${produto.xProd}</xProd>
            <NCM>${produto.NCM || ''}</NCM>
            <CEST>${produto.CEST || ''}</CEST>
            <CFOP>${produto.CFOP || '5405'}</CFOP>
            <uCom>${produto.uCom}</uCom>
            <qCom>${produto.qCom || 0}</qCom>
            <vUnCom>${produto.vUnCom || 0}</vUnCom>
            <vProd>${produto.total || 0}</vProd>
            <cEANTrib>${produto.cEANTrib || 'SEM GTIN'}</cEANTrib>
            <uTrib>${produto.uCom || ''}</uTrib>
            <qTrib>${produto.qCom || ''}</qTrib>
            <vUnTrib>${produto.vUnCom || ''}</vUnTrib>
            <indTot>1</indTot>
          </prod>
          <imposto>
            <ICMS>
              <ICMSSN102>
                <orig>0</orig>
                <CSOSN>102</CSOSN>
              </ICMSSN102>
            </ICMS>
            <PIS>
              <PISNT>
                <CST>08</CST>
              </PISNT>
            </PIS>
            <COFINS>
              <COFINSNT>
                <CST>08</CST>
              </COFINSNT>
            </COFINS>
          </imposto>
        </det>
        `;

    totalICMS += valorICMS;  // Acumulando o valor de ICMS
  });

  // Totais (total)
  const total = `  
      <total>
        <ICMSTot>
         <vBC>0.00</vBC>
					<vICMS>0.00</vICMS>
					<vICMSDeson>0.00</vICMSDeson>
					<vFCP>0.00</vFCP>
					<vBCST>0.00</vBCST>
					<vST>0.00</vST>
					<vFCPST>0.00</vFCPST>
					<vFCPSTRet>0.00</vFCPSTRet>
          <vProd>${totalPrice}</vProd>
          <vDesc>${desconto}</vDesc>
          <vFrete>0.00</vFrete>
					<vSeg>0.00</vSeg>
					<vDesc>0.00</vDesc>
					<vII>0.00</vII>
					<vIPI>0.00</vIPI>
					<vIPIDevol>0.00</vIPIDevol>
					<vPIS>0.00</vPIS>
					<vCOFINS>0.00</vCOFINS>
					<vOutro>0.00</vOutro>
					<vNF>25.09</vNF>
        </ICMSTot>
      </total>
    `;

  const transp = `
    		<transp>
				  <modFrete>9</modFrete>
			  </transp>
    `;
  // Pagamentos (pag)
  let pag = '';
  pagamentos.forEach((pagamento, index) => {
    let formaPagamento = '01';
    // Define o código da forma de pagamento
    switch (pagamento.forma) {
      case 'dinheiro':
        formaPagamento = '01';
        break;
      case 'cartaoDebito':
        formaPagamento = '04';
        break;
      case 'cartaoCredito':
        formaPagamento = '03';
        break;
      case 'pix':
        formaPagamento = '99';
        break;
      default:
        formaPagamento = '01'; // Mantém o padrão caso a forma de pagamento não seja reconhecida
    }


    pag += `  
        <pag>
          <detPag>
            <tPag>${pagamento.forma}</tPag>
            <vPag>${pagamento.valor}</vPag>
          </detPag>
        </pag>
      `;
  });

  // Dados de QRCode (infNFeSupl)
  const urlConsulta = `https://www.sefaz.mt.gov.br/nfce/consulta/${chaveAcesso}`; // URL de consulta para o estado de MT
  const qrCode = urlConsulta; // Função para gerar o QRCode com a URL de consulta

  // Dados do protocolo de autorização (protNFe)
  const protNFe = `  
      <protNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
        <infProt Id="ID${chaveAcesso}">
          <tpAmb>1</tpAmb> 
          <verAplic>4.00</verAplic> 
          <chNFe>${chaveAcesso}</chNFe>
          <dhRecbto>${dataconvertida}</dhRecbto> 
          <nProt>${numeroNota}</nProt> 
          <digVal>ABCDEFG1234567</digVal> 
          <cStat>100</cStat> 
          <xMotivo>Autorizado o uso da NF-e</xMotivo>
        </infProt>
      </protNFe>
    `;

  // Finalização do XML
  const xml = `  
      <nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
        <NFe xmlns="http://www.portalfiscal.inf.br/nfe">
          <infNFe versao="4.00" Id="NFe${chaveAcesso}">
            ${ide}
            ${emit}
            ${dest}
            ${det}
            ${total}
            ${transp}
            ${pag}
          </infNFe>
          <infNFeSupl>
              <qrCode>${qrCode}</qrCode>
              <urlConsulta>'http://www.sefaz.mt.gov.br/nfce/consultanfce'</urlConsulta>
            </infNFeSupl>
        </NFe>
        ${protNFe} <!-- Protocolo de autorização -->
      </nfeProc>
    `;

  return xml;
};

module.exports = { generateNFCeXML };