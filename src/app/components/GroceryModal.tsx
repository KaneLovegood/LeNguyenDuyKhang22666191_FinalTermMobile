import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GroceryItem } from "@/types/type";
import { GroceryFormValues } from "@/hooks/useGroceryItems";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: GroceryFormValues) => Promise<void> | void;
  initialItem: GroceryItem | null;
  loading?: boolean;
};

const defaultForm = {
  name: "",
  quantity: "1",
  category: "",
  bought: 0 as 0 | 1,
};

const GroceryModal = ({
  visible,
  onClose,
  onSubmit,
  initialItem,
  loading = false,
}: Props) => {
  const [form, setForm] = useState({
    ...defaultForm,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialItem) {
      setForm({
        name: initialItem.name,
        quantity: String(initialItem.quantity),
        category: initialItem.category ?? "",
        bought: initialItem.bought,
      });
    } else {
      setForm({ ...defaultForm });
    }
    setError("");
  }, [initialItem, visible]);

  const handleChange = (key: "name" | "quantity" | "category", value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      setError("Tên món không được rỗng.");
      return;
    }
    const payload: GroceryFormValues = {
      id: initialItem?.id,
      name: form.name,
      quantity: Number(form.quantity) || 1,
      category: form.category,
      bought: form.bought,
    };
    onSubmit(payload);
  };

  return (
    <Modal animationType="slide" visible={visible} transparent>
      <View className="flex-1 bg-black/40 justify-end">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View className="bg-white rounded-t-3xl p-5">
            <Text className="text-xl font-bold mb-4">
              {initialItem ? "Cập nhật món" : "Thêm món mới"}
            </Text>

            <Text className="text-sm mb-1">Tên món *</Text>
            <TextInput
              value={form.name}
              onChangeText={(text) => handleChange("name", text)}
              placeholder="Ví dụ: Rau cải"
              className="border border-gray-300 rounded-xl px-3 py-2 mb-3"
            />

            <Text className="text-sm mb-1">Số lượng</Text>
            <TextInput
              value={form.quantity}
              keyboardType="numeric"
              onChangeText={(text) => handleChange("quantity", text)}
              placeholder="1"
              className="border border-gray-300 rounded-xl px-3 py-2 mb-3"
            />

            <Text className="text-sm mb-1">Danh mục</Text>
            <TextInput
              value={form.category}
              onChangeText={(text) => handleChange("category", text)}
              placeholder="Thực phẩm, Đồ gia dụng..."
              className="border border-gray-300 rounded-xl px-3 py-2 mb-3"
            />

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm">Đánh dấu đã mua</Text>
              <Switch
                value={form.bought === 1}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, bought: value ? 1 : 0 }))
                }
                thumbColor={form.bought ? "#059669" : "#f4f3f4"}
              />
            </View>

            {!!error && <Text className="text-red-500 mb-2">{error}</Text>}

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 border border-gray-300 rounded-xl py-3"
                onPress={onClose}
                disabled={loading}
              >
                <Text className="text-center text-gray-600 font-semibold">
                  Hủy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-emerald-500 rounded-xl py-3"
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text className="text-center text-white font-semibold">
                  {loading ? "Đang lưu..." : "Lưu"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default GroceryModal;

