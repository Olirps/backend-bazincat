// src/services/ClientesService.js
const Empresa = require('../models/Empresa');
const { validarCnpj } = require('../util/util');
const { Op } = require('sequelize');



class EmpresaService {

    static async createEmpresa(dados) {
        let cpfCnpjLimpo = dados.cnpj.replace(/\D/g, ''); // Remove caracteres não numéricos
        if (!validarCnpj(cpfCnpjLimpo)) {
            throw new Error(`CNPJ: ${(dados.cnpj)} é inválido`);
        }
        const empresaExistente = await Empresa.findOne({ where: { cnpj: cpfCnpjLimpo } });
        if (empresaExistente) {
            throw new Error(`CNPJ: ${(dados.cnpj)} já cadastrado`);
        }
        try {
            const createdEmpresa = await Empresa.create({ ...dados, cnpj: (dados.cnpj)});
            return createdEmpresa
        } catch (err) {
            throw new Error(err.message);
        }
    }

    static async updateEmpresa(id, dados) {
        let cpfCnpjLimpo = dados.cnpj.replace(/\D/g, ''); // Remove caracteres não numéricos

        if (!validarCnpj(cpfCnpjLimpo)) {
            throw new Error(`CNPJ: ${(dados.cnpj)} é inválido`);
        }
        const empresaExistente = await Empresa.findOne({ where: { id } });
        if (!empresaExistente) {
            throw new Error(`Empresa com ID: ${id} não encontrada`);
        }
        try {
            await Empresa.update({ ...dados, cnpj: cpfCnpjLimpo }, { where: { id } });
            return await Empresa.findOne({ where: { id } });
        } catch (err) {
            throw new Error(err.message);
        }
    }

    static async deleteEmpresa(id) {
        const empresaExistente = await Empresa.findOne({ where: { id } });
        if (!empresaExistente) {
            throw new Error(`Empresa com ID: ${id} não encontrada`);
        }
        try {
            await Empresa.destroy({ where: { id } });
            return { message: 'Empresa deletada com sucesso' };
        } catch (err) {
            throw new Error(err.message);
        }
    }

    static async getAllEmpresas(filtros) {
        try {
            const empresas = await Empresa.findAll({ where: { ...filtros } });
            return empresas;
        } catch (err) {
            throw new Error(err.message);
        }
    }

    static async getEmpresaById(id) {
        try {
            const empresa = await Empresa.findOne({ where: { id } });
            if (!empresa) {
                throw new Error(`Empresa com ID: ${id} não encontrada`);
            }
            return empresa;
        } catch (err) {
            throw new Error(err.message);
        }
    }

}

module.exports = EmpresaService;