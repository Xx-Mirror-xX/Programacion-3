import { getCartDB } from '../database/cart.db.js';
import { getProductsDB } from '../database/products.db.js';

export const cartMethods = {
    // Obtener o crear carrito del usuario
    async getOrCreateCart(req, res) {
        const userId = req.user.id;
        const db = getCartDB();
        
        try {
            db.get(
                `SELECT * FROM carts WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
                [userId],
                (err, cart) => {
                    if (err) {
                        console.error('Error al obtener carrito:', err.message);
                        return res.status(500).json({ success: false, error: "Error al obtener carrito" });
                    }
                    
                    if (cart) {
                        db.all(
                            `SELECT * FROM cart_items WHERE cart_id = ?`,
                            [cart.id],
                            (err, items) => {
                                if (err) {
                                    console.error('Error al obtener items:', err.message);
                                    return res.status(500).json({ success: false, error: "Error al obtener items" });
                                }
                                res.json({ success: true, cartId: cart.id, items: items || [] });
                            }
                        );
                    } else {
                        db.run(
                            `INSERT INTO carts (user_id) VALUES (?)`,
                            [userId],
                            function(err) {
                                if (err) {
                                    console.error('Error al crear carrito:', err.message);
                                    return res.status(500).json({ success: false, error: "Error al crear carrito" });
                                }
                                res.json({ success: true, cartId: this.lastID, items: [] });
                            }
                        );
                    }
                }
            );
        } catch (error) {
            console.error('Error en getOrCreateCart:', error.message);
            res.status(500).json({ success: false, error: "Error en el servidor" });
        }
    },

    // Agregar producto al carrito
    async addToCart(req, res) {
        const { productId, quantity = 1 } = req.body;
        const userId = req.user.id;
        
        if (!productId) {
            return res.status(400).json({ success: false, error: "ID de producto requerido" });
        }

        const cartDb = getCartDB();
        const productsDb = getProductsDB();

        try {
            productsDb.get(
                `SELECT * FROM products WHERE id = ?`,
                [productId],
                (err, product) => {
                    if (err || !product) {
                        console.error('Producto no encontrado:', err?.message);
                        return res.status(404).json({ success: false, error: "Producto no encontrado" });
                    }

                    cartDb.get(
                        `SELECT * FROM carts WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
                        [userId],
                        (err, cart) => {
                            if (err) {
                                console.error('Error al obtener carrito:', err.message);
                                return res.status(500).json({ success: false, error: "Error al obtener carrito" });
                            }

                            const processCart = (cartId) => {
                                cartDb.get(
                                    `SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?`,
                                    [cartId, productId],
                                    (err, existingItem) => {
                                        if (err) {
                                            console.error('Error al verificar item:', err.message);
                                            return res.status(500).json({ success: false, error: "Error al verificar item" });
                                        }

                                        if (existingItem) {
                                            cartDb.run(
                                                `UPDATE cart_items SET quantity = quantity + ? WHERE id = ?`,
                                                [quantity, existingItem.id],
                                                function(err) {
                                                    if (err) {
                                                        console.error('Error al actualizar cantidad:', err.message);
                                                        return res.status(500).json({ success: false, error: "Error al actualizar cantidad" });
                                                    }
                                                    res.json({ success: true, message: "Cantidad actualizada en el carrito" });
                                                }
                                            );
                                        } else {
                                            cartDb.run(
                                                `INSERT INTO cart_items (cart_id, product_id, product_code, product_name, product_price, quantity) 
                                                 VALUES (?, ?, ?, ?, ?, ?)`,
                                                [cartId, productId, product.codigo, product.nombre, product.precio, quantity],
                                                function(err) {
                                                    if (err) {
                                                        console.error('Error al agregar al carrito:', err.message);
                                                        return res.status(500).json({ success: false, error: "Error al agregar al carrito" });
                                                    }
                                                    res.json({ success: true, message: "Producto agregado al carrito" });
                                                }
                                            );
                                        }
                                    }
                                );
                            };

                            if (cart) {
                                processCart(cart.id);
                            } else {
                                cartDb.run(
                                    `INSERT INTO carts (user_id) VALUES (?)`,
                                    [userId],
                                    function(err) {
                                        if (err) {
                                            console.error('Error al crear carrito:', err.message);
                                            return res.status(500).json({ success: false, error: "Error al crear carrito" });
                                        }
                                        processCart(this.lastID);
                                    }
                                );
                            }
                        }
                    );
                }
            );
        } catch (error) {
            console.error('Error en addToCart:', error.message);
            res.status(500).json({ success: false, error: "Error en el servidor" });
        }
    },

    // Obtener items del carrito
    async getCartItems(req, res) {
        const userId = req.user.id;
        const db = getCartDB();

        try {
            db.get(
                `SELECT * FROM carts WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
                [userId],
                (err, cart) => {
                    if (err) {
                        console.error('Error al obtener carrito:', err.message);
                        return res.status(500).json({ success: false, error: "Error al obtener carrito" });
                    }

                    if (!cart) {
                        return res.json({ success: true, items: [], total: 0 });
                    }

                    db.all(
                        `SELECT * FROM cart_items WHERE cart_id = ?`,
                        [cart.id],
                        (err, items) => {
                            if (err) {
                                console.error('Error al obtener items:', err.message);
                                return res.status(500).json({ success: false, error: "Error al obtener items" });
                            }

                            const total = items.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
                            res.json({ success: true, items: items || [], total });
                        }
                    );
                }
            );
        } catch (error) {
            console.error('Error en getCartItems:', error.message);
            res.status(500).json({ success: false, error: "Error en el servidor" });
        }
    },

    // Actualizar cantidad de un item
    async updateQuantity(req, res) {
        const { itemId, quantity } = req.body;
        const userId = req.user.id;

        if (!itemId || !quantity || quantity < 1) {
            return res.status(400).json({ success: false, error: "Cantidad inválida" });
        }

        const db = getCartDB();

        try {
            db.get(
                `SELECT carts.id FROM carts 
                 JOIN cart_items ON carts.id = cart_items.cart_id 
                 WHERE cart_items.id = ? AND carts.user_id = ?`,
                [itemId, userId],
                (err, result) => {
                    if (err || !result) {
                        console.error('Item no encontrado:', err?.message);
                        return res.status(404).json({ success: false, error: "Item no encontrado" });
                    }

                    db.run(
                        `UPDATE cart_items SET quantity = ? WHERE id = ?`,
                        [quantity, itemId],
                        function(err) {
                            if (err) {
                                console.error('Error al actualizar cantidad:', err.message);
                                return res.status(500).json({ success: false, error: "Error al actualizar cantidad" });
                            }
                            res.json({ success: true, message: "Cantidad actualizada" });
                        }
                    );
                }
            );
        } catch (error) {
            console.error('Error en updateQuantity:', error.message);
            res.status(500).json({ success: false, error: "Error en el servidor" });
        }
    },

    // Eliminar item del carrito
    async removeItem(req, res) {
        const { itemId } = req.params;
        const userId = req.user.id;

        const db = getCartDB();

        try {
            db.get(
                `SELECT carts.id FROM carts 
                 JOIN cart_items ON carts.id = cart_items.cart_id 
                 WHERE cart_items.id = ? AND carts.user_id = ?`,
                [itemId, userId],
                (err, result) => {
                    if (err || !result) {
                        console.error('Item no encontrado:', err?.message);
                        return res.status(404).json({ success: false, error: "Item no encontrado" });
                    }

                    db.run(
                        `DELETE FROM cart_items WHERE id = ?`,
                        [itemId],
                        function(err) {
                            if (err) {
                                console.error('Error al eliminar item:', err.message);
                                return res.status(500).json({ success: false, error: "Error al eliminar item" });
                            }
                            res.json({ success: true, message: "Producto eliminado del carrito" });
                        }
                    );
                }
            );
        } catch (error) {
            console.error('Error en removeItem:', error.message);
            res.status(500).json({ success: false, error: "Error en el servidor" });
        }
    },

    // Vaciar carrito
    async clearCart(req, res) {
        const userId = req.user.id;
        const db = getCartDB();

        try {
            db.get(
                `SELECT id FROM carts WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
                [userId],
                (err, cart) => {
                    if (err) {
                        console.error('Error al obtener carrito:', err.message);
                        return res.status(500).json({ success: false, error: "Error al obtener carrito" });
                    }

                    if (cart) {
                        db.run(
                            `DELETE FROM cart_items WHERE cart_id = ?`,
                            [cart.id],
                            function(err) {
                                if (err) {
                                    console.error('Error al vaciar carrito:', err.message);
                                    return res.status(500).json({ success: false, error: "Error al vaciar carrito" });
                                }
                                res.json({ success: true, message: "Carrito vaciado" });
                            }
                        );
                    } else {
                        res.json({ success: true, message: "Carrito vacío" });
                    }
                }
            );
        } catch (error) {
            console.error('Error en clearCart:', error.message);
            res.status(500).json({ success: false, error: "Error en el servidor" });
        }
    }
};
