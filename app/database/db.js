import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let db = null;

export function getDB() {
    if (!db) {
        try {
            const dbPath = process.env.USERS_DB_PATH || path.join(__dirname, 'users.db');
            
            const dbDir = path.dirname(dbPath);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }
            
            if (process.env.NODE_ENV === 'production') {
                sqlite3.verbose();
            }
            
            db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('❌ Error conectando a DB de usuarios:', err);
                    throw err;
                }
                console.log(`✅ Conectado a DB de usuarios: ${dbPath}`);
            });
            
        } catch (error) {
            console.error('❌ Error fatal en DB de usuarios:', error);
            throw error;
        }
    }
    return db;
}
