import { Stack } from "expo-router";
import "expo-router/entry";
import React, { useEffect } from "react";
import Toast from "react-native-toast-message"; // import Toast
import { Provider, useDispatch } from "react-redux";
import { store } from "../redux/store";

function AppBootstrap() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({ type: "auth/loadStoredAuth" });
  }, [dispatch]);

  return (
    <>
      <Stack>
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      </Stack>
      <Toast /> {/* Mount Toast globally */}
    </>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppBootstrap />
    </Provider>
  );
}
