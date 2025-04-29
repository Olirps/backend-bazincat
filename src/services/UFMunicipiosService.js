const UF = require('../models/Uf');
const Municipios = require('../models/Municipio');


class UFMunicipiosService {

  static async obterTodasUfs() {
    try {
      return await UF.findAll();
    } catch (err) {
      throw new Error(err.message);
    }
  }
  static async obterTodosMunicipios() {
    try {
      return await Municipios.findAll();
    } catch (err) {
      throw new Error(err.message);
    }
  }
  static async obterMunicipiosPorUF(codUfId) {
    // Buscar produtos na tabela ItensNaoIdentificados
    const municipios = await Municipios.findAll({
      where: {
        codUfId
      }// Ajuste conforme os campos da tabela
    });
    return municipios;

  }
  static async obterUFPorId(dados) {
    try {
      return await UF.findOne({ where: { codIBGE: dados.codIBGE } });
    } catch (err) {
      throw new Error(err.message);
    }
  }
  static async obterMunicipioPorId(dados) {
    try {
      return await Municipios.findOne({ where: { codMunIBGE: dados.codMunIBGE } });
    } catch (err) {
      throw new Error(err.message);
    }
  }
  
  static async getMunicipioById(dados) {
    try {
      return await Municipios.findByPk(dados);
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

module.exports = UFMunicipiosService;