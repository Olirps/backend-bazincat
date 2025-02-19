async function dividirNotaFiscal(jsonData) {
  try {


    // Verifica se jsonData é um objeto
    if (typeof jsonData !== 'object' || jsonData === null) {
      throw new Error('jsonData deve ser um objeto JSON válido');
    }

    // Certifique-se de que jsonData é um objeto JavaScript
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

    // Verifique se a estrutura é a esperada
    const nfe = data.nfeProc?.NFe?.infNFe?.ide;
    const nfeFornecedor = data.nfeProc?.NFe?.infNFe?.emit;
    const nfeImpostoNf = data.nfeProc?.NFe?.infNFe?.total?.ICMSTot;
    const nfePagamento = data.nfeProc?.NFe?.infNFe?.pag;



    if (!nfe || !nfeFornecedor) {
      throw new Error('Estrutura do JSON não corresponde ao esperado.');
    }

    // Função auxiliar para acessar valores com fallback
    const getValue = (obj, path, defaultValue = null) => {
      return path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : defaultValue), obj);
    };


    function getFornecedorInfo(informacoesFornecedor) {
      return {
        CNPJ: informacoesFornecedor.CNPJ|| '',
        xNome: informacoesFornecedor.xNome|| '',
        xFant: informacoesFornecedor.xFant|| '',
        // ... outros campos
        endereco: {
          xLgr: informacoesFornecedor.enderEmit.xLgr|| '',
          nro: informacoesFornecedor.enderEmit.nro|| '',
          xBairro: informacoesFornecedor.enderEmit.xBairro|| '',
          cMun: informacoesFornecedor.enderEmit.cMun|| '',
          xMun: informacoesFornecedor.enderEmit.xMun|| '',
          UF: informacoesFornecedor.enderEmit.UF|| '',
          CEP: informacoesFornecedor.enderEmit.CEP|| '',
          cPais: informacoesFornecedor.enderEmit.cPais|| '',
          xPais: informacoesFornecedor.enderEmit.xPais|| '',
          fone: informacoesFornecedor.enderEmit.fone|| '',
          // ... outros campos do endereço
        }
      };
    }

    // Obtendo as informações do ide com fallback
    const informacoesIde = nfe|| {};
    const informacoesFornecedor = nfeFornecedor|| {};
    informacoesIde.vProd = nfeImpostoNf?.vProd || {}; // valor nf sem desconto
    informacoesIde.vNF = nfeImpostoNf?.vNF || 0; // valor nf com desconto
    informacoesIde.vDesc = nfeImpostoNf?.vDesc || 0;
    informacoesIde.vFrete = nfeImpostoNf?.vFrete || 0;
    informacoesIde.vBC = nfeImpostoNf?.vBC || 0; //base de calculo icms
    informacoesIde.vICMS = nfeImpostoNf?.vICMS || 0;
    informacoesIde.vTotTrib = nfeImpostoNf?.vTotTrib || 0; //total tributos sem icms
    // Extraindo informações do emit (fornecedor)
    const fornecedor = getFornecedorInfo(informacoesFornecedor);


    // Extraindo informações da nota fiscal
    // Imprimindo as informações para depuração

    // Retorne os campos necessários
    return {
      informacoesIde,
      fornecedor: fornecedor,
      pagamento: nfePagamento
    };
  } catch (error) {
    console.error('Erro ao dividir Nota Fiscal:', error);
    throw error; // Lance o erro para ser tratado por quem chamou a função
  }
}

module.exports = {
  dividirNotaFiscal
};