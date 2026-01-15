import { Colors } from "@/constants/colors";
import { setActiveSessionId } from "@/redux/slices/sessionSlice";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";
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

import { useDispatch, useSelector } from "react-redux";
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
  const dispatch = useDispatch();

  const userId = user?._id;
  const [sessions, setSessions] = useState<any[]>([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );

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

  React.useEffect(() => {
    if (segments[1] !== "session") {
      setDeleteMode(false);
      setSelectedSessionId(null);
      if (currentSessionId) dispatch(setActiveSessionId(null));
    }
  }, [segments]);

  const handleSessionPress = async (s: any) => {
    if (deleteMode) {
      setSelectedSessionId(s._id);
      Alert.alert("Delete Session?", "This action cannot be undone", [
        { text: "Cancel", style: "cancel", onPress: () => setSelectedSessionId(null) },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteSession(s._id);
            setSessions((prev) => prev.filter((sess) => sess._id !== s._id));
            setSelectedSessionId(null);
            setDeleteMode(false);

            if (currentSessionId === s._id) {
              dispatch(setActiveSessionId(null));
              router.push("/");
            }
          },
        },
      ]);
    } else {
      dispatch(setActiveSessionId(s._id)); // update Redux before navigation
      router.push(`/session/${s._id}`);
    }
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
      <Pressable
        style={{ flex: 1 }}
        onPress={() => {
          if (deleteMode) setDeleteMode(false);
        }}
      >
        {/* User Profile Section */}
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || "U"}</Text>
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.username}>{user?.name || "Guest"}</Text>
          </View>
        </View>

        <View style={styles.menuItems}>
          <DrawerItemList {...props} />
        </View>

        {/* Sessions List */}
        {sessions.length > 0 && (
          <View style={styles.sessionSection}>
            <View style={styles.sessionHeader}>
              <Text style={styles.sessionTitle}>RECENT SESSIONS</Text>
              <TouchableOpacity onPress={() => setDeleteMode(!deleteMode)} hitSlop={10}>
                <Ionicons name="trash-outline" size={20} color={deleteMode ? "red" : Colors.textGray} />
              </TouchableOpacity>
            </View>

            {sessions.map((s) => (
              <DrawerItem
                key={s._id}
                onPress={() => handleSessionPress(s)}
                style={[
                  styles.sessionItem,
                  s._id === currentSessionId && styles.sessionItemActive,
                  deleteMode && s._id === selectedSessionId && { backgroundColor: "rgba(255,0,0,0.2)" },
                ]}
                label={() => (
                  <View style={styles.sessionLabelContainer}>
                    <View style={{ flex: 1 }}>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.sessionRole,
                          // Use textGray instead of gray2 fix
                          s._id === currentSessionId ? { color: Colors.white } : { color: Colors.textGray },
                        ]}
                      >
                        {s.role || "Interview"}
                      </Text>
                      <Text style={styles.sessionMeta}>{getSessionMeta(s, sessions)}</Text>
                    </View>
                    {!s.isCompleted && (
                      <View style={styles.incompleteDot} />
                    )}
                  </View>
                )}
              />
            ))}
          </View>
        )}
      </Pressable>
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  const { user } = useSelector((s: RootState) => s.auth);

  return (
    <Drawer
      drawerContent={(props) => <CustomContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerTitle: "",
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: Colors.background,
          elevation: 0, // Android shadow removal
          shadowOpacity: 0, // iOS shadow removal
          borderBottomWidth: 0,
        },
        headerTintColor: Colors.white,
        drawerStyle: styles.drawer,
        drawerActiveTintColor: Colors.textGray,
        drawerActiveBackgroundColor: Colors.primary,
        drawerInactiveTintColor: Colors.white,
        drawerLabelStyle: { fontSize: 16, fontWeight: "500" },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: "Home",
          drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          title: "Profile",
          drawerItemStyle: { display: user ? "flex" : "none" },
          drawerIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />
        }}
      />
      <Drawer.Screen
        name="analytics_screen"
        options={{
          title: "Analytics",
          drawerItemStyle: { display: user ? "flex" : "none" },
          drawerIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" size={size} color={color} />
        }}
      />
      <Drawer.Screen
        name="select_interview"
        options={{
          title: "Select Interview",
          drawerIcon: ({ color, size }) => <Ionicons name="add-circle-outline" size={size} color={color} />
        }}
      />
      <Drawer.Screen
        name="login"
        options={{
          title: "Login",
          drawerItemStyle: { display: user ? "none" : "flex" },
          drawerIcon: ({ color, size }) => <Ionicons name="log-in-outline" size={size} color={color} />
        }}
      />
      <Drawer.Screen
        name="register"
        options={{
          title: "Register",
          drawerItemStyle: { display: user ? "none" : "flex" },
          drawerIcon: ({ color, size }) => <Ionicons name="person-add-outline" size={size} color={color} />
        }}
      />
      <Drawer.Screen name="interview_chat" options={{ title: "Ai Interview", drawerItemStyle: { display: "none" } }} />
      <Drawer.Screen name="session/[id]" options={{ title: "Session", drawerItemStyle: { display: "none" } }} />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 20,
  },
  drawer: {
    backgroundColor: Colors.background,
    width: 300,
  },
  userSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 30,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  welcomeText: {
    color: Colors.textGray,
    fontSize: 12,
  },
  username: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  menuItems: {
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  sessionSection: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  sessionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.textGray,
    letterSpacing: 1,
  },
  sessionItem: {
    borderRadius: 12,
    marginVertical: 2,
    paddingVertical: 4,
  },
  sessionItemActive: {
    backgroundColor: Colors.primary,
  },
  sessionLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionRole: {
    fontSize: 15,
    fontWeight: "600",
  },
  sessionMeta: {
    fontSize: 12,
    color: Colors.textGray,
    marginTop: 2,
  },
  incompleteDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "orange",
    marginLeft: 8,
  },
});
