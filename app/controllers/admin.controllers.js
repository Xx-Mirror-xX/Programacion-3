import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getAdminDB } from '../database/admin.db.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

if (!JWT_SECRET) {
    console.error('\n❌ ERROR CRÍTICO: JWT_SECRET no está definido en el archivo .env');
    console.error('📌 Por favor, configura JWT_SECRET en las variables de entorno de Render\n');
}

export const methods = {
    async register(req, res) {
        const { user, email, password } = req.body;
        
        if (!user || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: "Todos los campos son obligatorios" 
            });
        }

        const db = getAdminDB();
        
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            
            db.run(
                "INSERT INTO admin_users (username, email, password, admin_level) VALUES (?, ?, ?, ?)",
                [user, email, hashedPassword, 'vip'],
                function(err) {
                    if (err) {
                        console.error('Error en registro admin:', err.message);
                        if (err.message.includes('UNIQUE constraint failed')) {
                            if (err.message.includes('username')) {
                                return res.status(400).json({ 
                                    success: false, 
                                    error: "El nombre de usuario ya existe" 
                                });
                            } else if (err.message.includes('email')) {
                                return res.status(400).json({ 
                                    success: false, 
                                    error: "El correo electrónico ya está registrado" 
                                });
                            }
                        }
                        return res.status(500).json({ 
                            success: false, 
                            error: "Error al registrar administrador" 
                        });
                    }
                    
                    res.json({ 
                        success: true, 
                        message: "Administrador registrado exitosamente",
                        userId: this.lastID
                    });
                }
            );
        } catch (error) {
            console.error('Error en registro admin:', error.message);
            res.status(500).json({ 
                success: false, 
                error: "Error en el servidor" 
            });
        }
    },

    async login(req, res) {
        const { user, password } = req.body;
        
        if (!user || !password) {
            return res.status(400).json({ 
                success: false, 
                error: "Usuario y contraseña son obligatorios" 
            });
        }

        const db = getAdminDB();
        
        try {
            db.get(
                "SELECT * FROM admin_users WHERE username = ? OR email = ?",
                [user, user],
                async (err, row) => {
                    if (err) {
                        console.error('Error en login admin:', err.message);
                        return res.status(500).json({ 
                            success: false, 
                            error: "Error en el servidor" 
                        });
                    }
                    
                    if (!row) {
                        return res.status(401).json({ 
                            success: false, 
                            error: "Credenciales de administrador incorrectas" 
                        });
                    }
                    
                    const validPassword = await bcrypt.compare(password, row.password);
                    
                    if (!validPassword) {
                        return res.status(401).json({ 
                            success: false, 
                            error: "Credenciales de administrador incorrectas" 
                        });
                    }
                    
                    const token = jwt.sign(
                        { 
                            id: row.id, 
                            username: row.username, 
                            email: row.email,
                            admin_level: row.admin_level,
                            type: 'admin'
                        },
                        JWT_SECRET,
                        { expiresIn: JWT_EXPIRES_IN }
                    );
                    
                    res.cookie('adminToken', token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        maxAge: 24 * 60 * 60 * 1000
                    });
                    
                    res.json({ 
                        success: true, 
                        message: "Login de administrador exitoso",
                        token,
                        user: {
                            id: row.id,
                            username: row.username,
                            email: row.email,
                            admin_level: row.admin_level,
                            type: 'admin'
                        }
                    });
                }
            );
        } catch (error) {
            console.error('Error en login admin:', error.message);
            res.status(500).json({ 
                success: false, 
                error: "Error en el servidor" 
            });
        }
    },

    async logout(req, res) {
        res.clearCookie('adminToken');
        res.json({ success: true, message: "Sesión de administrador cerrada exitosamente" });
    }
};
