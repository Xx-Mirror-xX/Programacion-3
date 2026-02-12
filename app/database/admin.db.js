import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let adminDb = null;

export function getAdminDB() {
    if (!adminDb) {
        try {
            const dbPath = process.env.ADMIN_DB_PATH || path.join(__dirname, 'admin.db');
            
            const dbDir = path.dirname(dbPath);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }
            
            if (process.env.NODE_ENV === 'production') {
                sqlite3.verbose();
            }
            
            adminDb = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('❌ Error conectando a DB de admins:', err);
                    throw err;
                }
                console.log(`✅ Conectado a DB de admins: ${dbPath}`);
            });
            
        } catch (error) {
            console.error('❌ Error fatal en DB de admins:', error);
            throw error;
        }
    }
    return adminDb;
}
