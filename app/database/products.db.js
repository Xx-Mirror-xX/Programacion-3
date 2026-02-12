import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let productsDb = null;

export function getProductsDB() {
    if (!productsDb) {
        try {
            const dbPath = process.env.PRODUCTS_DB_PATH || path.join(__dirname, '../data/products.db');
            productsDb = new sqlite3.Database(dbPath);
            console.log(`✅ DB Productos: ${path.basename(dbPath)}`);
        } catch (error) {
            console.error('❌ Error DB productos:', error.message);
            throw error;
        }
    }
    return productsDb;
}
