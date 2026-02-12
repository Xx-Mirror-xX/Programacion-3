import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let cartDb = null;

export function getCartDB() {
    if (!cartDb) {
        const dbPath = process.env.CART_DB_PATH || path.join(__dirname, 'cart.db');
        cartDb = new sqlite3.Database(dbPath);
    }
    return cartDb;
}