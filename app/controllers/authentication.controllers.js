import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDB } from '../database/db.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

if (!JWT_SECRET) {
    console.error('\n❌ ERROR CRÍTICO: JWT_SECRET no está definido en el archivo .env');
    process.exit(1);
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

        const db = getDB();
        
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            
            db.run(
                "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
                [user, email, hashedPassword],
                function(err) {
                    if (err) {
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
                            error: "Error al registrar usuario" 
                        });
                    }
                    
                    res.json({ 
                        success: true, 
                        message: "Usuario registrado exitosamente",
                        userId: this.lastID
                    });
                }
            );
        } catch (error) {
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

        const db = getDB();
        
        db.get(
            "SELECT * FROM users WHERE username = ? OR email = ?",
            [user, user],
            async (err, row) => {
                if (err) {
                    return res.status(500).json({ 
                        success: false, 
                        error: "Error en el servidor" 
                    });
                }
                
                if (!row) {
                    return res.status(401).json({ 
                        success: false, 
                        error: "Usuario o contraseña incorrectos" 
                    });
                }
                
                const validPassword = await bcrypt.compare(password, row.password);
                
                if (!validPassword) {
                    return res.status(401).json({ 
                        success: false, 
                        error: "Usuario o contraseña incorrectos" 
                    });
                }
                
                const token = jwt.sign(
                    { 
                        id: row.id, 
                        username: row.username, 
                        email: row.email,
                        type: 'user'
                    },
                    JWT_SECRET,
                    { expiresIn: JWT_EXPIRES_IN }
                );
                
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax',
                    maxAge: 24 * 60 * 60 * 1000
                });
                
                res.json({ 
                    success: true, 
                    message: "Login exitoso",
                    token,
                    user: {
                        id: row.id,
                        username: row.username,
                        email: row.email,
                        type: 'user'
                    }
                });
            }
        );
    },

    async logout(req, res) {
        res.clearCookie('token');
        res.json({ success: true, message: "Sesión cerrada exitosamente" });
    }
};