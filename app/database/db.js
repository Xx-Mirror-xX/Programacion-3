import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let db = null;

export function getDB() {
    if (!db) {
        try {
            const dbPath = process.env.USERS_DB_PATH || path.join(__dirname, '../data/users.db');
            db = new sqlite3.Database(dbPath);
            console.log(`✅ DB Usuarios: ${path.basename(dbPath)}`);
        } catch (error) {
            console.error('❌ Error DB usuarios:', error.message);
            throw error;
        }
    }
    return db;
}
