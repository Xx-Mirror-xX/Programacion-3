import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let cartDb = null;

export function getCartDB() {
    if (!cartDb) {
        try {
            const dbPath = process.env.CART_DB_PATH || path.join(__dirname, 'cart.db');
            
            const dbDir = path.dirname(dbPath);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }
            
            if (process.env.NODE_ENV === 'production') {
                sqlite3.verbose();
            }
            
            cartDb = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('❌ Error conectando a DB de carritos:', err);
                    throw err;
                }
                console.log(`✅ Conectado a DB de carritos: ${dbPath}`);
            });
            
        } catch (error) {
            console.error('❌ Error fatal en DB de carritos:', error);
            throw error;
        }
    }
    return cartDb;
}
