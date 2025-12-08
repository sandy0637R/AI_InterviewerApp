import { Stack } from "expo-router";
import "expo-router/entry";
import React from "react";
import { Provider } from "react-redux";
import { store } from "../redux/store"; // <-- adjust path if needed

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Stack>
        {/* Main Drawer Navigator */}
        <Stack.Screen
          name="(drawer)"
          options={{ headerShown: false }}
        />

        {/* Chat screen outside drawer */}
        <Stack.Screen
          name="InterviewChat"
          options={{ title: "AI Interviewer" }}
        />
      </Stack>
    </Provider>
  );
}
