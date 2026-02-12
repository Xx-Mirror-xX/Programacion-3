import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let cartDb = null;

export function getCartDB() {
    if (!cartDb) {
        try {
            const dbPath = process.env.CART_DB_PATH || path.join(__dirname, '../data/cart.db');
            
            cartDb = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('❌ Error conectando a DB de carritos:', err.message);
                    throw err;
                }
            });
            
            console.log(`✅ DB Carritos lista: ${path.basename(dbPath)}`);
            
        } catch (error) {
            console.error('❌ Error fatal en DB de carritos:', error.message);
            throw error;
        }
    }
    return cartDb;
}
