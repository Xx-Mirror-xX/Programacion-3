import { getAdminDB } from './admin.db.js';

export function initializeAdminDatabase() {
    const db = getAdminDB();
    
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS admin_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                admin_level TEXT DEFAULT 'vip',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('Error creating admin table:', err);
            } else {
                console.log('✅ Admin database initialized');
            }
        });
    });
    

}