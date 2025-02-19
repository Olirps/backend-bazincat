const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/UserLogin');
const GrupoAcesso = require("../models/GrupoAcesso");
const Permissoes = require("../models/Permissoes");


const registerUser = async (username, password, cpfUser,grupoAcessoId) => {
    try {
        // Verifica se o usuário já existe
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            throw new Error('Usuário já existe');
        }
        // Criptografa a senha
        const hashedPassword = bcrypt.hashSync(password, 10);
        // Cria o novo usuário
        const user = await User.create({ username, password: hashedPassword, cpfUser,grupoAcessoId});
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
};

const authenticateUser = async (username, password) => {
    try {
        const user = await User.findOne({
            where: { username }
        });

        if (!user) {
            throw new Error('Usuário ou senha inválidos');
        }
        // Valida a senha
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Usuário ou senha inválidos');
        }

        // Buscar as permissões do usuário
        const permissoes = await Permissoes.findAll({
            where: { grupoAcessoId: user.grupoAcessoId }
        });

        // Converter as instâncias do Sequelize para objetos simples
        const permissoesData = permissoes.map(permission => permission.toJSON());

        // Garantindo que o user seja um objeto simples
        const userPlain = user.toJSON ? user.toJSON() : user; // Se user for uma instância Sequelize, converte para objeto simples

        // Atribuindo as permissões ao usuário
        userPlain.permissoes = permissoesData;


        // Criar o token JWT com as permissões e dados do usuário
        const token = jwt.sign(
            { id: user.id, username: user.username, permissoes: permissoesData },
            process.env.JWT_SECRET
        );

        // Retornar o usuário com as permissões e o token
        return { user: userPlain, token };
    } catch (error) {
        throw new Error(error.message);
    }
};


module.exports = { registerUser, authenticateUser };
