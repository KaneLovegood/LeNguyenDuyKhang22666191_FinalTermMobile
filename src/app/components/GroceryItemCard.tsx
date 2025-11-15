import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { GroceryItem } from "@/types/type";

type Props = {
  item: GroceryItem;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

const GroceryItemCard = ({ item, onToggle, onEdit, onDelete }: Props) => {
  return (
    <View className="bg-white border border-gray-200 rounded-2xl p-4 mb-3 shadow-sm">
      <TouchableOpacity onPress={onToggle} activeOpacity={0.8}>
        <View className="flex-row justify-between items-center mb-2">
          <Text
            className={`text-lg font-semibold ${
              item.bought ? "text-gray-400 line-through" : "text-gray-900"
            }`}
          >
            {item.name}
          </Text>
          <View
            className={`px-3 py-1 rounded-full ${
              item.bought ? "bg-emerald-100" : "bg-orange-100"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                item.bought ? "text-emerald-700" : "text-orange-700"
              }`}
            >
              {item.bought ? "Đã mua" : "Cần mua"}
            </Text>
          </View>
        </View>
        <Text className="text-gray-600">
          Số lượng:{" "}
          <Text className="font-semibold text-gray-800">
            {item.quantity}
          </Text>
        </Text>
        {!!item.category && (
          <Text className="text-gray-500 mt-1">Danh mục: {item.category}</Text>
        )}
      </TouchableOpacity>

      <View className="flex-row justify-end gap-3 mt-3">
        <TouchableOpacity
          className="px-3 py-1 rounded-lg border border-gray-300"
          onPress={onEdit}
        >
          <Text className="text-gray-700 font-semibold">Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="px-3 py-1 rounded-lg border border-red-300"
          onPress={onDelete}
        >
          <Text className="text-red-600 font-semibold">Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GroceryItemCard;

