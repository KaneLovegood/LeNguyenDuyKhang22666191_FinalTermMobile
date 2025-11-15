import { useCallback, useEffect, useMemo, useState } from "react";
import { SQLiteDatabase } from "expo-sqlite";
import { GroceryItem } from "@/types/type";
import {
  deleteGroceryItem,
  getGroceryItems,
  insertGroceryItem,
  toggleGroceryItem,
  updateGroceryItem,
  upsertGrocerySuggestions,
  GroceryInsertPayload,
} from "@/db";

export type GroceryFormValues = {
  id?: number;
  name: string;
  quantity?: number;
  category?: string;
  bought?: 0 | 1;
};

const API_ENDPOINT = "https://jsonplaceholder.typicode.com/todos?_limit=15";

export const useGroceryItems = (db: SQLiteDatabase) => {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadItems = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const data = await getGroceryItems(db);
        setItems(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("Không thể tải danh sách. Vui lòng thử lại.");
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [db]
  );

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const saveItem = useCallback(
    async (values: GroceryFormValues) => {
      const trimmedName = values.name?.trim();
      if (!trimmedName) {
        throw new Error("Tên món không được để trống.");
      }
      const payload: GroceryInsertPayload = {
        name: trimmedName,
        quantity: Number(values.quantity) || 1,
        category: values.category?.trim() ?? "",
        bought: values.bought ?? 0,
      };

      try {
        if (values.id) {
          await updateGroceryItem(db, { ...payload, id: values.id });
        } else {
          await insertGroceryItem(db, payload);
        }
        await loadItems(false);
      } catch (error) {
        console.error(error);
        throw new Error("Không thể lưu món. Vui lòng thử lại.");
      }
    },
    [db, loadItems]
  );

  const toggleBought = useCallback(
    async (id: number) => {
      try {
        await toggleGroceryItem(db, id);
        await loadItems(false);
      } catch (error) {
        console.error(error);
        setErrorMessage("Không thể cập nhật trạng thái món.");
      }
    },
    [db, loadItems]
  );

  const deleteItem = useCallback(
    async (id: number) => {
      try {
        await deleteGroceryItem(db, id);
        await loadItems(false);
      } catch (error) {
        console.error(error);
        setErrorMessage("Không thể xóa món. Vui lòng thử lại.");
      }
    },
    [db, loadItems]
  );

  const importFromApi = useCallback(async () => {
    setImporting(true);
    try {
      const response = await fetch(API_ENDPOINT);
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("API trả về dữ liệu không hợp lệ");
      }
      const mapped: GroceryInsertPayload[] = data.map((item: any, index: number) => ({
        name: item.title ?? `Gợi ý ${index + 1}`,
        quantity: (item.id % 5) + 1 || 1,
        category: item.completed ? "Đã mua" : "Gợi ý",
        bought: item.completed ? 1 : 0,
      }));
      await upsertGrocerySuggestions(db, mapped);
      await loadItems(false);
    } catch (error) {
      console.error(error);
      setErrorMessage("Import thất bại. Kiểm tra kết nối và thử lại.");
    } finally {
      setImporting(false);
    }
  }, [db, loadItems]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadItems(false);
    setRefreshing(false);
  }, [loadItems]);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return items;
    return items.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(keyword);
      const categoryMatch = item.category?.toLowerCase().includes(keyword);
      return nameMatch || categoryMatch;
    });
  }, [items, search]);

  const clearError = useCallback(() => setErrorMessage(null), []);

  return {
    items: filteredItems,
    totalItems: items.length,
    search,
    setSearch,
    loading,
    refreshing,
    importing,
    errorMessage,
    clearError,
    saveItem,
    toggleBought,
    deleteItem,
    importFromApi,
    onRefresh,
  };
};

