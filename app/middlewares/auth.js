import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const verifyToken = (req, res, next) => {
    const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        if (req.method === 'GET' && req.path === '/admin') {
            return res.redirect('/');
        }
        return res.status(401).json({ 
            success: false, 
            error: "Token no proporcionado" 
        });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (req.method === 'GET' && req.path === '/admin') {
            return res.redirect('/');
        }
        return res.status(401).json({ 
            success: false, 
            error: "Token inválido o expirado" 
        });
    }
};

export const verifyAdminToken = (req, res, next) => {
    const token = req.cookies?.adminToken || req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        if (req.method === 'GET' && req.path === '/adminvip') {
            return res.redirect('/loginadmin');
        }
        return res.status(401).json({ 
            success: false, 
            error: "Token de administrador no proporcionado" 
        });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.type !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                error: "Acceso no autorizado" 
            });
        }
        req.admin = decoded;
        next();
    } catch (error) {
        if (req.method === 'GET' && req.path === '/adminvip') {
            return res.redirect('/loginadmin');
        }
        return res.status(401).json({ 
            success: false, 
            error: "Token de administrador inválido o expirado" 
        });
    }
};