import { Stack } from "expo-router";
import React, { useEffect } from "react";
import Toast from "react-native-toast-message";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "../redux/store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { setupInterceptors } from "../api/client";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <AppBootstrap />
      </Provider>
    </GestureHandlerRootView>
  );
}

function AppBootstrap() {
  const dispatch = useDispatch();
  const initialized = useSelector((state: any) => state.auth.initialized);

  useEffect(() => {
    setupInterceptors(store); // ✅ Initialize Axios Interceptors (Token Injection)
    dispatch({ type: "auth/loadStoredAuth" });
  }, [dispatch]);

  if (!initialized) {
    return null; // Or a custom Loading View if Native Splash hides too early
  }

  return (
    <>
      <Stack>
        <Stack.Screen
          name="(drawer)"
          options={{ headerShown: false }}
        />
      </Stack>
      <Toast />
    </>
  );
}
