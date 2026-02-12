import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let productsDb = null;

export function getProductsDB() {
    if (!productsDb) {
        try {
            const dbPath = process.env.PRODUCTS_DB_PATH || path.join(__dirname, 'products.db');
            
            const dbDir = path.dirname(dbPath);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }
            
            if (process.env.NODE_ENV === 'production') {
                sqlite3.verbose();
            }
            
            productsDb = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('❌ Error conectando a DB de productos:', err);
                    throw err;
                }
                console.log(`✅ Conectado a DB de productos: ${dbPath}`);
            });
            
        } catch (error) {
            console.error('❌ Error fatal en DB de productos:', error);
            throw error;
        }
    }
    return productsDb;
}
