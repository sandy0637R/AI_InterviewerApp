import { Colors } from "@/constants/colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useRouter, useSegments } from "expo-router";
import Drawer from "expo-router/drawer";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSelector } from "react-redux";
import { deleteSession, getUserSessions } from "../../api/interview";
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
  const currentSessionId = useSelector(
    (s: RootState) => s.session.activeSessionId
  );

  const userId = user?._id;
  const [sessions, setSessions] = useState<any[]>([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );

  const router = useRouter();
  const segments = useSegments();

  console.log("🔹 Drawer segments:", segments);

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

  React.useEffect(() => {
    if (segments[1] !== "session") {
      setDeleteMode(false);
      setSelectedSessionId(null);
    }
  }, [segments]);

  const handleSessionPress = async (s: any) => {
    console.log("👉 Session pressed:", s._id);
    console.log("📍 Current session from redux:", currentSessionId);

    if (deleteMode) {
      setSelectedSessionId(s._id);
      Alert.alert("Delete Session?", "This action cannot be undone", [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setSelectedSessionId(null),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            console.log("🗑️ Deleting session:", s._id);

            await deleteSession(s._id);
            setSessions((prev) =>
              prev.filter((sess) => sess._id !== s._id)
            );
            setSelectedSessionId(null);
            setDeleteMode(false);

            console.log(
              "🧠 Compare current vs deleted:",
              currentSessionId,
              s._id,
              currentSessionId === s._id
            );

            if (currentSessionId === s._id) {
              console.log("🚀 Navigating to HOME");
              router.push("/");
            }
          },
        },
      ]);
    } else {
      if (currentSessionId !== s._id) {
        router.push(`/session/${s._id}`);
      }
    }
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContent}
    >
      <Pressable
        style={{ flex: 1 }}
        onPress={() => {
          if (deleteMode) setDeleteMode(false);
        }}
      >
        <View style={styles.userSection}>
          <FontAwesome
            name="user-circle-o"
            size={50}
            color={Colors.secondary}
          />
          <Text style={styles.username}>{user?.name || "User"}</Text>
        </View>

        <DrawerItemList {...props} />

        {sessions.length > 0 && (
          <Pressable onPress={() => {}} style={styles.sessionSection}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginHorizontal: 16,
              }}
            >
              <Text style={styles.sessionTitle}>Your Sessions</Text>
              <TouchableOpacity onPress={() => setDeleteMode(!deleteMode)}>
                <AntDesign
                  name="delete"
                  size={18}
                  color={deleteMode ? "red" : Colors.secondary}
                />
              </TouchableOpacity>
            </View>

            {sessions.map((s) => (
              <DrawerItem
                key={s._id}
                onPress={() => handleSessionPress(s)}
                style={[
                  styles.sessionItem,
                  s._id === currentSessionId
                    ? { backgroundColor: Colors.white }
                    : {},
                  deleteMode && s._id === selectedSessionId
                    ? { backgroundColor: "red" }
                    : {},
                ]}
                label={() => (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View>
                      <Text
                        style={[
                          styles.sessionRole,
                          deleteMode && s._id === selectedSessionId
                            ? { color: "white" }
                            : s.isCompleted
                            ? { color: Colors.white }
                            : { color: Colors.textGray },
                        ]}
                      >
                        {s.role || "Interview"}
                      </Text>
                      <Text style={styles.sessionMeta}>
                        {getSessionMeta(s, sessions)}
                      </Text>
                    </View>
                    {!s.isCompleted && (
                      <AntDesign
                        name="exclamation-circle"
                        size={15}
                        color="red"
                        style={{ marginLeft: 8 }}
                      />
                    )}
                  </View>
                )}
              />
            ))}
          </Pressable>
        )}
      </Pressable>
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
          headerStyle: { backgroundColor: Colors.primary },
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
          options={{
            title: "Profile",
            drawerItemStyle: { display: user ? "flex" : "none" },
          }}
        />
        <Drawer.Screen
          name="select_interview"
          options={{ title: "Select Interview" }}
        />
        <Drawer.Screen
          name="login"
          options={{
            title: "Login",
            drawerItemStyle: { display: user ? "none" : "flex" },
          }}
        />
        <Drawer.Screen
          name="register"
          options={{
            title: "Register",
            drawerItemStyle: { display: user ? "none" : "flex" },
          }}
        />
        <Drawer.Screen
          name="interview_chat"
          options={{ title: "Ai Interview", drawerItemStyle: { display: "none" } }}
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
    fontSize: 14,
    fontWeight: "600",
    color: Colors.secondary,
    marginBottom: 5,
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
    color: Colors.textGray,
    marginTop: 2,
  },
});
