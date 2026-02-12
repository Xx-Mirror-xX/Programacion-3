import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let productsDb = null;

export function getProductsDB() {
    if (!productsDb) {
        try {
            const dbPath = process.env.PRODUCTS_DB_PATH || path.join(__dirname, '../data/products.db');
            
            productsDb = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('❌ Error conectando a DB de productos:', err.message);
                    throw err;
                }
            });
            
            console.log(`✅ DB Productos lista: ${path.basename(dbPath)}`);
            
        } catch (error) {
            console.error('❌ Error fatal en DB de productos:', error.message);
            throw error;
        }
    }
    return productsDb;
}
