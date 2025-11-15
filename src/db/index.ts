import { openDatabaseSync, SQLiteDatabase } from 'expo-sqlite';

const db: SQLiteDatabase = openDatabaseSync('grocery.db');

export const initDatabase = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS grocery_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      category TEXT,
      bought INTEGER DEFAULT 0,
      created_at INTEGER
    );
  `);
};

export default db;