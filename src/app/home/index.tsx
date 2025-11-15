import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGroceryItems, GroceryFormValues } from "@/hooks/useGroceryItems";
import GroceryItemCard from "../components/GroceryItemCard";
import GroceryModal from "../components/GroceryModal";
import { GroceryItem } from "@/types/type";

const HomeScreen = () => {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const {
    items,
    totalItems,
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
  } = useGroceryItems(db);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [saving, setSaving] = useState(false);

  const handleOpenModal = (item?: GroceryItem) => {
    setEditingItem(item ?? null);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setEditingItem(null);
    setModalVisible(false);
  };

  const handleSubmit = async (values: GroceryFormValues) => {
    setSaving(true);
    try {
      await saveItem(values);
      handleCloseModal();
    } catch (error: any) {
      Alert.alert("Lưu thất bại", error?.message ?? "Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (item: GroceryItem) => {
    const message = `Bạn có chắc chắn muốn xóa "${item.name}"?`;
    if (Platform.OS === "web") {
      const confirmed =
        typeof window !== "undefined" ? window.confirm(message) : true;
      if (confirmed) deleteItem(item.id);
      return;
    }

    Alert.alert(
      "Xóa món",
      message,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => deleteItem(item.id),
        },
      ],
      { cancelable: true }
    );
  };

  const headerSummary = useMemo(() => {
    const boughtCount = items.filter((item) => item.bought === 1).length;
    const remain = totalItems - boughtCount;
    return { boughtCount, remain };
  }, [items, totalItems]);

  return (
    <View
      className="flex-1 bg-white px-4"
      style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }}
    >
      <Text className="text-3xl font-bold text-center mb-3">
        Grocery List
      </Text>

      <View className="flex-row justify-between items-center mb-3">
        <View>
          <Text className="text-base text-gray-600">
            Tổng: {totalItems} món
          </Text>
          <Text className="text-sm text-gray-500">
            Đã mua: {headerSummary.boughtCount} • Cần mua: {headerSummary.remain}
          </Text>
        </View>
        <TouchableOpacity
          className="bg-emerald-500 px-4 py-2 rounded-lg"
          onPress={() => handleOpenModal()}
        >
          <Text className="text-white font-semibold">+ Thêm món</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Tìm kiếm theo tên hoặc danh mục..."
        value={search}
        onChangeText={setSearch}
        className="border border-gray-200 rounded-lg px-3 py-2 mb-3"
      />

      <TouchableOpacity
        className="border border-blue-500 rounded-lg px-4 py-2 mb-3"
        onPress={importFromApi}
        disabled={importing}
      >
        <Text className="text-center text-blue-600 font-semibold">
          {importing ? "Đang import..." : "Import từ API"}
        </Text>
      </TouchableOpacity>

      {errorMessage && (
        <TouchableOpacity
          className="bg-red-100 border border-red-300 rounded-lg px-3 py-2 mb-3"
          onPress={clearError}
        >
          <Text className="text-red-700 text-sm">{errorMessage}</Text>
          <Text className="text-red-500 text-xs mt-1">
            Chạm để ẩn thông báo.
          </Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
          <Text className="mt-3 text-gray-500">Đang tải danh sách...</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <GroceryItemCard
              item={item}
              onToggle={() => toggleBought(item.id)}
              onEdit={() => handleOpenModal(item)}
              onDelete={() => confirmDelete(item)}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={
            <View className="items-center justify-center mt-12 px-4">
              <Text className="text-5xl mb-3">🛒</Text>
              <Text className="text-lg font-semibold mb-1">
                Danh sách trống!
              </Text>
              <Text className="text-center text-gray-500">
                Thêm món cần mua hoặc import từ API để bắt đầu quản lý chuyến
                đi chợ của bạn.
              </Text>
            </View>
          }
        />
      )}

      <GroceryModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialItem={editingItem}
        loading={saving}
      />
    </View>
  );
};

export default HomeScreen;