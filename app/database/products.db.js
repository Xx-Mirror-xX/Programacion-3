import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let productsDb = null;

export function getProductsDB() {
    if (!productsDb) {
        const dbPath = process.env.PRODUCTS_DB_PATH || path.join(__dirname, 'products.db');
        productsDb = new sqlite3.Database(dbPath);
    }
    return productsDb;
}