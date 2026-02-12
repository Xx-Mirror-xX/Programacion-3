import { getProductsDB } from '../database/products.db.js';

export const productsMethods = {
    async createProduct(req, res) {
        const { codigo, nombre, precio, descripcion } = req.body;
        const adminId = req.admin.id;
        
        if (!codigo || !nombre || !precio) {
            return res.status(400).json({ 
                success: false, 
                error: "Código, nombre y precio son obligatorios" 
            });
        }
        
        if (isNaN(precio) || precio <= 0) {
            return res.status(400).json({ 
                success: false, 
                error: "El precio debe ser un número mayor a 0" 
            });
        }

        const db = getProductsDB();
        
        db.run(
            `INSERT INTO products (codigo, nombre, precio, descripcion, created_by) 
             VALUES (?, ?, ?, ?, ?)`,
            [codigo.toUpperCase(), nombre, parseFloat(precio), descripcion || '', adminId],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ 
                            success: false, 
                            error: "Ya existe un producto con ese código" 
                        });
                    }
                    return res.status(500).json({ 
                        success: false, 
                        error: "Error al crear el producto" 
                    });
                }
                
                res.json({ 
                    success: true, 
                    message: "Producto creado exitosamente",
                    productId: this.lastID
                });
            }
        );
    },

    async getAllProducts(req, res) {
        const db = getProductsDB();
        
        db.all(
            `SELECT * FROM products ORDER BY created_at DESC`,
            [],
            (err, rows) => {
                if (err) {
                    return res.status(500).json({ 
                        success: false, 
                        error: "Error al obtener productos" 
                    });
                }
                
                res.json({ 
                    success: true, 
                    products: rows 
                });
            }
        );
    },

    async getProductById(req, res) {
        const { id } = req.params;
        const db = getProductsDB();
        
        db.get(
            `SELECT * FROM products WHERE id = ?`,
            [id],
            (err, row) => {
                if (err) {
                    return res.status(500).json({ 
                        success: false, 
                        error: "Error al obtener el producto" 
                    });
                }
                
                if (!row) {
                    return res.status(404).json({ 
                        success: false, 
                        error: "Producto no encontrado" 
                    });
                }
                
                res.json({ 
                    success: true, 
                    product: row 
                });
            }
        );
    },

    async getProductByCode(req, res) {
        const { codigo } = req.params;
        const db = getProductsDB();
        
        db.get(
            `SELECT * FROM products WHERE codigo = ?`,
            [codigo.toUpperCase()],
            (err, row) => {
                if (err) {
                    return res.status(500).json({ 
                        success: false, 
                        error: "Error al obtener el producto" 
                    });
                }
                
                if (!row) {
                    return res.status(404).json({ 
                        success: false, 
                        error: "Producto no encontrado" 
                    });
                }
                
                res.json({ 
                    success: true, 
                    product: row 
                });
            }
        );
    },

    async updateProduct(req, res) {
        const { id } = req.params;
        const { nombre, precio, descripcion } = req.body;
        
        if (precio !== undefined && (isNaN(precio) || precio <= 0)) {
            return res.status(400).json({ 
                success: false, 
                error: "El precio debe ser un número mayor a 0" 
            });
        }

        const db = getProductsDB();
        
        db.run(
            `UPDATE products 
             SET nombre = COALESCE(?, nombre),
                 precio = COALESCE(?, precio),
                 descripcion = COALESCE(?, descripcion),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [nombre, precio, descripcion, id],
            function(err) {
                if (err) {
                    return res.status(500).json({ 
                        success: false, 
                        error: "Error al actualizar el producto" 
                    });
                }
                
                if (this.changes === 0) {
                    return res.status(404).json({ 
                        success: false, 
                        error: "Producto no encontrado" 
                    });
                }
                
                res.json({ 
                    success: true, 
                    message: "Producto actualizado exitosamente" 
                });
            }
        );
    },

    async deleteProduct(req, res) {
        const { id } = req.params;
        const db = getProductsDB();
        
        db.run(
            `DELETE FROM products WHERE id = ?`,
            [id],
            function(err) {
                if (err) {
                    return res.status(500).json({ 
                        success: false, 
                        error: "Error al eliminar el producto" 
                    });
                }
                
                if (this.changes === 0) {
                    return res.status(404).json({ 
                        success: false, 
                        error: "Producto no encontrado" 
                    });
                }
                
                res.json({ 
                    success: true, 
                    message: "Producto eliminado exitosamente" 
                });
            }
        );
    }
};