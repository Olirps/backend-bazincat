// src/util/util.js

/**
 * Função para extrair e limpar os dados do corpo da requisição.
 * Remove caracteres não numéricos do CPF.
 *
 * @param {Object} body - Corpo da requisição contendo nome, cpf e email.
 * @returns {Object} - Objeto com os dados da pessoa, incluindo CPF limpo.
 */
function limpaCpf(body) {
    const { nome, cpf, email } = body;
  
    // Remover caracteres não numéricos do CPF
    const cpfLimpo = cpf.replace(/\D/g, '');
  
    // Retornar o objeto com os dados tratados
    return {
      nome,
      cpf: cpfLimpo,
      email,
    };
}

function limpaDocumento(body) {
    // Função para limpar CPF
    const limpaCpf = (cpf) => cpf.replace(/\D/g, '');

    // Função para limpar CNPJ
    const limpaCnpj = (cnpj) => cnpj.replace(/\D/g, '');

    // Função para identificar e limpar CPF ou CNPJ
    const limparCpfCnpj = (cpfCnpj) => {
        const cpfCnpjLimpo = cpfCnpj.replace(/\D/g, '');
        let tamanhocpfCnpj = cpfCnpjLimpo.length

        // Verifica se é CPF (11 dígitos) ou CNPJ (14 dígitos)
        if (tamanhocpfCnpj === 11) {
            return limpaCpf(cpfCnpj);
        } else if (tamanhocpfCnpj === 14) {
            return limpaCnpj(cpfCnpj);
        } else {
            return cpfCnpjLimpo; // Retorna o valor original se não for CPF nem CNPJ
        }
    };

    // Copiar o objeto para não modificar o original
    const bodyLimpo = { ...body };

    // Limpar o campo cpfCnpj, se estiver presente
    if (bodyLimpo.cpfCnpj) {
        bodyLimpo.cpfCnpj = limparCpfCnpj(bodyLimpo.cpfCnpj);
    }

    // Retornar o objeto com o dado tratado
    return bodyLimpo;
}

/**
 * Função para validar o CPF.
 * 
 * @param {string} cpf - O CPF a ser validado.
 * @returns {boolean} - Retorna true se o CPF for válido, caso contrário, false.
 */
function validarCpf(cpf) {
    const cpfLimpo = cpf.replace(/\D/g, ''); // Remove caracteres não numéricos

    let tamanhocpf = cpfLimpo.length

    if (tamanhocpf !== 11) return false; // CPF deve ter 11 dígitos

    // Verifica se todos os dígitos são iguais (ex.: 111.111.111-11)
    if (/^(\d)\1+$/.test(cpfLimpo)) return false;

    // Valida o CPF usando o cálculo dos dígitos verificadores
    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10;i++) {
        soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;

    return true;
}

function validarCnpj(cnpj) {
    const cnpjLimpo = cnpj.replace(/\D/g, ''); // Remove caracteres não numéricos
    let tamanhocnpj = cnpjLimpo.length

    if (tamanhocnpj !== 14) return false; // CNPJ deve ter 14 dígitos

    // Valida o CNPJ usando o cálculo dos dígitos verificadores
    let soma = 0;
    let resto;
    const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    for (let i = 0; i < 12; i++) {
        soma += parseInt(cnpjLimpo[i]) * pesos1[i];
    }

    resto = soma % 11;
    if (resto < 2) resto = 0;
    else resto = 11 - resto;
    if (resto !== parseInt(cnpjLimpo[12])) return false;

    soma = 0;
    for (let i = 0; i < 13; i++) {
        soma += parseInt(cnpjLimpo[i]) * pesos2[i];
    }

    resto = soma % 11;
    if (resto < 2) resto = 0;
    else resto = 11 - resto;
    if (resto !== parseInt(cnpjLimpo[13])) return false;

    return true;
}

function dataAtual() {
    const agora = new Date();
  
    // Formata a data diretamente no fuso horário correto
    const formatter = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Cuiaba",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  
    const [
      { value: dia },
      ,
      { value: mes },
      ,
      { value: ano },
      ,
      { value: hora },
      ,
      { value: minuto },
      ,
      { value: segundo }
    ] = formatter.formatToParts(agora);
  
    // Retorna a data formatada no padrão `YYYY-MM-DD HH:MM:SS`
    return `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
  }

module.exports = {
    limpaCpf,
    limpaDocumento,
    validarCpf,
    validarCnpj,
    dataAtual
};
