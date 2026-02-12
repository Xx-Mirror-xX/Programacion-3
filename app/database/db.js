import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db = null;

export function getDB() {
    if (!db) {
        const dbPath = process.env.USERS_DB_PATH || path.join(__dirname, 'users.db');
        db = new sqlite3.Database(dbPath);
    }
    return db;
}