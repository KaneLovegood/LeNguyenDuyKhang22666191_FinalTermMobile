import { SQLiteDatabase } from "expo-sqlite";
import { GroceryItem } from "@/types/type";

const TABLE_NAME = "grocery_items";

export type GroceryInsertPayload = {
  name: string;
  quantity?: number;
  category?: string;
  bought?: 0 | 1;
};

export type GroceryUpdatePayload = GroceryInsertPayload & { id: number };

const normalizeItem = (item: any): GroceryItem => ({
  id: Number(item.id),
  name: item.name ?? "",
  quantity: Number(item.quantity ?? 1),
  category: item.category ?? "",
  bought: (Number(item.bought) === 1 ? 1 : 0) as 0 | 1,
  created_at: Number(item.created_at ?? Date.now()),
});

export const initDatabase = async (db: SQLiteDatabase) => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      category TEXT,
      bought INTEGER DEFAULT 0,
      created_at INTEGER
    );
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_${TABLE_NAME}_name
    ON ${TABLE_NAME}(name);
  `);

  await seedSampleItems(db);
};

const seedSampleItems = async (db: SQLiteDatabase) => {
  const count = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM ${TABLE_NAME};`
  );
  if ((count?.count ?? 0) > 0) return;

  const now = Date.now();
  const defaults: GroceryInsertPayload[] = [
    { name: "Sữa tươi", quantity: 2, category: "Thực phẩm" },
    { name: "Trứng gà", quantity: 10, category: "Thực phẩm" },
    { name: "Bánh mì", quantity: 1, category: "Ăn sáng" },
  ];

  await db.withTransactionAsync(async () => {
    for (const [index, item] of defaults.entries()) {
      await db.runAsync(
        `INSERT INTO ${TABLE_NAME} (name, quantity, category, bought, created_at)
         VALUES (?, ?, ?, ?, ?);`,
        [
          item.name,
          item.quantity ?? 1,
          item.category ?? "",
          item.bought ?? 0,
          now + index,
        ]
      );
    }
  });
};

export const getGroceryItems = async (db: SQLiteDatabase) => {
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM ${TABLE_NAME} ORDER BY created_at DESC;`
  );
  return rows.map(normalizeItem);
};

export const insertGroceryItem = async (
  db: SQLiteDatabase,
  payload: GroceryInsertPayload
) => {
  const now = Date.now();
  await db.runAsync(
    `INSERT INTO ${TABLE_NAME} (name, quantity, category, bought, created_at)
     VALUES (?, ?, ?, ?, ?);`,
    [
      payload.name,
      payload.quantity ?? 1,
      payload.category ?? "",
      payload.bought ?? 0,
      now,
    ]
  );
};

export const updateGroceryItem = async (
  db: SQLiteDatabase,
  payload: GroceryUpdatePayload
) => {
  await db.runAsync(
    `UPDATE ${TABLE_NAME}
     SET name = ?, quantity = ?, category = ?, bought = ?
     WHERE id = ?;`,
    [
      payload.name,
      payload.quantity ?? 1,
      payload.category ?? "",
      payload.bought ?? 0,
      payload.id,
    ]
  );
};

export const toggleGroceryItem = async (db: SQLiteDatabase, id: number) => {
  await db.runAsync(
    `UPDATE ${TABLE_NAME}
     SET bought = CASE WHEN bought = 1 THEN 0 ELSE 1 END
     WHERE id = ?;`,
    [id]
  );
};

export const deleteGroceryItem = async (db: SQLiteDatabase, id: number) => {
  await db.runAsync(`DELETE FROM ${TABLE_NAME} WHERE id = ?;`, [id]);
};

export const upsertGrocerySuggestions = async (
  db: SQLiteDatabase,
  items: GroceryInsertPayload[]
) => {
  if (!items.length) return;
  await db.withTransactionAsync(async () => {
    for (const item of items) {
      const normalizedName = item.name.trim();
      await db.runAsync(
        `INSERT INTO ${TABLE_NAME} (name, quantity, category, bought, created_at)
         SELECT ?, ?, ?, ?, ?
         WHERE NOT EXISTS (
           SELECT 1 FROM ${TABLE_NAME}
           WHERE lower(name) = lower(?)
         );`,
        [
          normalizedName,
          item.quantity ?? 1,
          item.category ?? "",
          item.bought ?? 0,
          Date.now(),
          normalizedName,
        ]
      );
    }
  });
};