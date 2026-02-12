import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let adminDb = null;

export function getAdminDB() {
    if (!adminDb) {
        try {
            const dbPath = process.env.ADMIN_DB_PATH || path.join(__dirname, '../data/admin.db');
            adminDb = new sqlite3.Database(dbPath);
            console.log(`✅ DB Admins: ${path.basename(dbPath)}`);
        } catch (error) {
            console.error('❌ Error DB admins:', error.message);
            throw error;
        }
    }
    return adminDb;
}
