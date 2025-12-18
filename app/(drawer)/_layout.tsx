// app/(drawer)/_layout.tsx
import { Colors } from "@/constants/colors";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import Drawer from "expo-router/drawer";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
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
  if (!userId) {
    setSessions([]); // ✅ clear sessions on logout
    return;
  }

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
              label={`Session ${s._id.slice(-4)}`}
              onPress={() => handleSessionPress(s._id)}
              labelStyle={styles.sessionLabel}
              style={styles.sessionItem}
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
          drawerStyle: styles.drawer,
          drawerActiveTintColor: Colors.grey4,
          drawerInactiveTintColor: Colors.white,
          drawerLabelStyle: { fontSize: 16, fontWeight: "500" },
        }}
      >
        <Drawer.Screen name="index" options={{ title: "Home" }} />
        <Drawer.Screen name="profile" options={{ title: "Profile" ,drawerItemStyle: { display: user ? "flex" : "none" },}} />
        <Drawer.Screen
          name="select_interview"
          options={{ title: "Select Interview" }}
        />
        <Drawer.Screen name="login" options={{ title: "Login" , drawerItemStyle: { display: user ? "none" : "flex" }, }} />
        <Drawer.Screen name="register" options={{ title: "Register" , drawerItemStyle: { display: user ? "none" : "flex" }, }} />
        <Drawer.Screen
          name="interview_chat"
          options={{ drawerItemStyle: { display: "none" } }}
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
  drawer: { backgroundColor: Colors.primary, width: 280 , },
  userSection: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary,
    marginBottom: 10,
    flex:1,
    flexDirection:'row',
    alignItems: 'center',
  },
 
  username: { fontSize: 18, fontWeight: "bold", color: Colors.secondary,marginLeft: 10  },
  sessionSection: { marginTop: 10,},
  sessionTitle: { marginLeft: 16, fontSize: 14, fontWeight: "600", color: Colors.secondary, marginBottom: 5 , borderBottomWidth: 1, borderBottomColor:Colors.secondary, paddingBottom:6,width: 100},
  sessionItem: { marginVertical: 2 },
  sessionLabel: { fontSize: 15, color: Colors.white },
});
