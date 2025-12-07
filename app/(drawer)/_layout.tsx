// app/(drawer)/_layout.tsx
import { Drawer } from "expo-router/drawer";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: true,
        }}
      >
        <Drawer.Screen name="index" options={{ title: "Home" }} />
        <Drawer.Screen name="profile" options={{ title: "Profile" }} />
        <Drawer.Screen name="select_interview" options={{ title: "SelectInterview" }} />
        <Drawer.Screen name="interview_chat" options={{ title:"Ai Interview", drawerItemStyle: { display: "none" } }} />
        
      </Drawer>
    </GestureHandlerRootView>
  );
}
