const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Pega o token do Header

    if (!token) {
        return res.status(401).json({ mensagem: "Token não fornecido" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Salva os dados do usuário no request
        next();
    } catch (error) {
        return res.status(401).json({ mensagem: "Token inválido ou expirado" });
    }
};

module.exports = authMiddleware;