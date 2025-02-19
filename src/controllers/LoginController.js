// controllers/userController.js
const { registerUser, authenticateUser } = require("../services/userService");
const Permissoes = require("../models/Permissoes");

const register = async (req, res) => {
    const { username, password, cpfUser,grupoAcessoId } = req.body;

    try {
        const user = await registerUser(username, password, cpfUser,grupoAcessoId);
        res.status(201).json({ message: "Usuário registrado com sucesso", userId: user.id });
    } catch (error) {
        res.status(500).json({ message: "Erro ao registrar usuário", error: error.message });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const { user, token } = await authenticateUser(username, password);

        // Buscar as permissões do grupo de acesso do usuário
        const permissoes = await Permissoes.findAll({
            where: { grupoAcessoId: user.grupoAcessoId }
        });

        // Adiciona as permissões ao objeto de usuário
        user.permissoes = permissoes;

        // Enviar resposta com as permissões
        res.json({ message: 'Autenticado com sucesso', user, token });

    } catch (error) {
        res.status(400).json({ message: "Usuário ou senha inválidos", error: error.message });
    }
};

module.exports = { register, login };