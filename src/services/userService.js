const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/UserLogin');

const registerUser = async (username, password, cpfUser) => {
    try {
        // Verifica se o usuário já existe
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            throw new Error('Usuário já existe');
        }
        // Criptografa a senha
        const hashedPassword = bcrypt.hashSync(password, 10);
        // Cria o novo usuário
        const user = await User.create({ username, password: hashedPassword, cpfUser });
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
};

const authenticateUser = async (username, password) => {
    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            throw new Error('Usuário ou senha inválidos');
        }
        // Valida a senha
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Usuário ou senha inválidos');
        }
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            /*{ expiresIn: '4h' }*/
        );
        return { user, token };
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = { registerUser, authenticateUser };
