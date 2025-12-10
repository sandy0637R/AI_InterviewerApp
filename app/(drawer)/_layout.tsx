// app/(drawer)/_layout.tsx
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import Drawer from "expo-router/drawer";

import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSelector } from "react-redux";
import { getUserSessions } from "../../api/interview";
import { RootState } from "../../redux/store";

function CustomContent(props: any) {
  const { user } = useSelector((s: RootState) => s.auth);
  const userId = user?._id;
  const [sessions, setSessions] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    const fetchSessions = async () => {
      try {
        const res = await getUserSessions(userId);
        if (res.success && res.sessions) {
          setSessions(res.sessions);
        }
      } catch (err: any) {
        console.log("Error fetching sessions:", err.message);
      }
    };

    fetchSessions();
  }, [userId]);

  const handleSessionPress = (sessionId: string) => {
    // Safe navigation using expo-router
    router.push(`/session/${sessionId}`);
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />

      {sessions.length > 0 &&
        sessions.map((s) => (
          <DrawerItem
            key={s._id}
            label={`Session ${s._id.slice(-4)}`}
            onPress={() => handleSessionPress(s._id)}
          />
        ))}
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomContent {...props} />}
        screenOptions={{ headerShown: true }}
      >
        <Drawer.Screen name="index" options={{ title: "Home" }} />
        <Drawer.Screen name="profile" options={{ title: "Profile" }} />
        <Drawer.Screen
          name="select_interview"
          options={{ title: "Select Interview" }}
        />
        <Drawer.Screen name="login" options={{ title: "Login" }} />
        <Drawer.Screen
          name="interview_chat"
          options={{ drawerItemStyle: { display: "none" } }}
        />

        {/* Required for dynamic session navigation */}
        <Drawer.Screen
          name="session/[id]"
          options={{
            title: "Session",
            drawerItemStyle: { display: "none" },
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
