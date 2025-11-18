import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "minha_chave_secreta";

// 1. Middleware para autenticar o token e injetar o nível de acesso (Role) na requisição
export function autenticarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    // Assumes que o token está no formato 'Bearer <token>'
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) return res.status(401).json({ message: "Token não fornecido." });

    jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
        if (err) return res.status(403).json({ message: "Token inválido ou expirado." });
        
        // INJETANDO os dados decodificados (que devem incluir 'nivelAcesso')
        req.user = decodedUser; 
        
        next();
    });
}

// 2. Função geradora de middleware para verificar o nível de acesso (Autorização)
// O array 'allowedRoles' define quais níveis podem acessar a rota.
export function autorizarNivelAcesso(allowedRoles) {
    return (req, res, next) => {
        // O nivelAcesso deve estar presente no token, injetado por 'autenticarToken'
        const userRole = req.user && req.user.nivelAcesso; 

        if (!userRole) {
            // Se o token não tem nivelAcesso, nega acesso.
            return res.status(403).json({ message: "Permissão negada. Nível de acesso ausente no token." });
        }

        // Verifica se o nível do usuário está na lista de permitidos
        if (allowedRoles.includes(userRole)) {
            next(); // Permissão concedida
        } else {
            // Permissão negada
            return res.status(403).json({ message: "Acesso restrito. Você não possui permissão suficiente." });
        }
    };
}