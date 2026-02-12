import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDB } from '../database/db.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

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
                        console.error('Error en registro:', err.message);
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
            console.error('Error en registro:', error.message);
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
        
        try {
            db.get(
                "SELECT * FROM users WHERE username = ? OR email = ?",
                [user, user],
                async (err, row) => {
                    if (err) {
                        console.error('Error en login:', err.message);
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
                        secure: process.env.NODE_ENV === 'production',
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
        } catch (error) {
            console.error('Error en login:', error.message);
            res.status(500).json({ 
                success: false, 
                error: "Error en el servidor" 
            });
        }
    },

    async logout(req, res) {
        res.clearCookie('token');
        res.json({ success: true, message: "Sesión cerrada exitosamente" });
    }
};
