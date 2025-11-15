// types.ts
export type GroceryItem = {
    id: number;
    name: string;
    quantity: number;
    category?: string;
    bought: 0 | 1;
    created_at: number;
  };