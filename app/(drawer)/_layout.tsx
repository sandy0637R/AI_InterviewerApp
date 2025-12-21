// app/(drawer)/_layout.tsx
import { Colors } from "@/constants/colors";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useRouter, useSegments } from "expo-router";
import Drawer from "expo-router/drawer";
import React, { useState } from "react";

import { StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSelector } from "react-redux";
import { getUserSessions } from "../../api/interview";
import { RootState } from "../../redux/store";

function getSessionMeta(session: any, allSessions: any[]) {
  const date = new Date(session.createdAt);
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();

  const sameDaySameRole = allSessions.filter((s) => {
    const d = new Date(s.createdAt);
    return (
      s.role === session.role &&
      d.getDate() === date.getDate() &&
      d.getMonth() === date.getMonth() &&
      d.getFullYear() === date.getFullYear()
    );
  });

  if (sameDaySameRole.length > 1) {
    const time = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${month} ${day} • ${time}`;
  }

  return `${month} ${day}`;
}

function CustomContent(props: any) {
  const { user } = useSelector((s: RootState) => s.auth);
  const userId = user?._id;
  const [sessions, setSessions] = useState<any[]>([]);
  const router = useRouter();
  const segments = useSegments();


 React.useEffect(() => {
  if (!userId) {
    setSessions([]);
    return;
  }

  const fetchSessions = async () => {
    try {
      const res = await getUserSessions(userId);
      if (res.success && res.sessions) {
        setSessions(
          [...res.sessions].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          )
        );
      }
    } catch (err: any) {
      console.log("Error fetching sessions:", err.message);
    }
  };

  fetchSessions();
}, [userId, segments]);



const handleSessionPress = (sessionId: string) => {
  // segments example: ["(drawer)", "session", "[id]"]
  const currentSessionId =
    segments[1] === "session" ? segments[2] : null;

  // ✅ If already on same session → ignore click
  if (currentSessionId === sessionId) {
    return;
  }

  router.push(`/session/${sessionId}`);
};


  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
      <View style={styles.userSection}>
        <FontAwesome name="user-circle-o" size={50} color={Colors.secondary} />
        <Text style={styles.username}>{user?.name || "User"}</Text>
      </View>

      <DrawerItemList {...props} />

      {sessions.length > 0 && (
        <View style={styles.sessionSection}>
          <Text style={styles.sessionTitle}>Your Sessions</Text>

          {sessions.map((s) => (
            <DrawerItem
              key={s._id}
              onPress={() => handleSessionPress(s._id)}
              style={styles.sessionItem}
              label={() => (
                <View>
                  <Text style={styles.sessionRole}>
                    {s.role || "Interview"}
                  </Text>
                  <Text style={styles.sessionMeta}>
                    {getSessionMeta(s, sessions)}
                  </Text>
                </View>
              )}
            />
          ))}
        </View>
      )}
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  const { user } = useSelector((s: RootState) => s.auth);

  return (
    <GestureHandlerRootView style={styles.container}>
      <Drawer
        drawerContent={(props) => <CustomContent {...props} />}
        screenOptions={{
          headerShown: true,
          headerStyle:{backgroundColor:Colors.primary},
           headerTintColor: Colors.white,
          drawerStyle: styles.drawer,
          drawerActiveTintColor: Colors.textGray,
          drawerInactiveTintColor: Colors.white,
          drawerLabelStyle: { fontSize: 16, fontWeight: "500" },
        }}
      >
        <Drawer.Screen name="index" options={{ title: "Home" }} />
        <Drawer.Screen
          name="profile"
          options={{ title: "Profile", drawerItemStyle: { display: user ? "flex" : "none" } }}
        />
        <Drawer.Screen name="select_interview" options={{ title: "Select Interview" }} />
        <Drawer.Screen
          name="login"
          options={{ title: "Login", drawerItemStyle: { display: user ? "none" : "flex" } }}
        />
        <Drawer.Screen
          name="register"
          options={{ title: "Register", drawerItemStyle: { display: user ? "none" : "flex" } }}
        />
        <Drawer.Screen
          name="interview_chat"
          options={{title:"Ai Interview" ,drawerItemStyle: { display: "none" } }}
        />
        <Drawer.Screen
          name="session/[id]"
          options={{ title: "Session", drawerItemStyle: { display: "none" } }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  drawerContent: { paddingVertical: 10 },
  drawer: { backgroundColor: Colors.primary, width: 280 },

  userSection: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  username: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.secondary,
    marginLeft: 10,
  },

  sessionSection: { marginTop: 10 },

  sessionTitle: {
    marginLeft: 16,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.secondary,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary,
    paddingBottom: 6,
    width: 120,
  },

  sessionItem: { marginVertical: 4 },

  sessionRole: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.white,
  },

  sessionMeta: {
    fontSize: 12,
    color: Colors.grey4,
    marginTop: 2,
  },
}); 