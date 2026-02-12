import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let db = null;

export function getDB() {
    if (!db) {
        try {
            const dbPath = process.env.USERS_DB_PATH || path.join(__dirname, '../data/users.db');
            db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('❌ Error conectando a DB de usuarios:', err.message);
                    throw err;
                }
            });
            
            console.log(`✅ DB Usuarios lista: ${path.basename(dbPath)}`);
            
        } catch (error) {
            console.error('❌ Error fatal en DB de usuarios:', error.message);
            throw error;
        }
    }
    return db;
}
