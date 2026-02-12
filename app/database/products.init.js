import { getProductsDB } from './products.db.js';

export function initializeProductsDatabase() {
    const db = getProductsDB();
    
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                codigo TEXT UNIQUE NOT NULL,
                nombre TEXT NOT NULL,
                precio REAL NOT NULL,
                descripcion TEXT,
                created_by INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('Error creating products table:', err);
            } else {
                console.log('✅ Products database initialized');
                
                db.get("SELECT COUNT(*) as count FROM products", [], (err, row) => {
                    if (!err && row.count === 0) {
                        db.run(`
                            INSERT INTO products (codigo, nombre, precio, descripcion, created_by) 
                            VALUES 
                            ('PAN001', 'Pan Duro', 10.00, 'Es un pan... no pidas mucho.', 1),
                            ('PAN002', 'Pan Suave', 25.00, 'otro pan, pero mas costoso', 1),
                            ('PAN003', 'Pan Elegante', 1000.00, 'Compralo, no te vas a arrepentir, este pan tiene... Nada', 1)
                        `);
                    }
                });
            }
        });
    });
}