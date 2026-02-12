import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let adminDb = null;

export function getAdminDB() {
    if (!adminDb) {
        const dbPath = process.env.ADMIN_DB_PATH || path.join(__dirname, 'admin.db');
        adminDb = new sqlite3.Database(dbPath);
    }
    return adminDb;
}