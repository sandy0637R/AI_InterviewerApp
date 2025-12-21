import { Stack } from "expo-router";
import "expo-router/entry";
import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "../redux/store";

function AppBootstrap() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({ type: "auth/loadStoredAuth" });
  }, [dispatch]);

  return (
    <Stack>
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppBootstrap />
    </Provider>
  );
}
