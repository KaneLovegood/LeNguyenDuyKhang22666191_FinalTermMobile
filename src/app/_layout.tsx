import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { initDatabase } from "@/db";

export default function Layout() {
  return (
    <SQLiteProvider databaseName="grocery.db" onInit={initDatabase}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="home/index" />
        </Stack>
      </SafeAreaProvider>
    </SQLiteProvider>
  );
}
