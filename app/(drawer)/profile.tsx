import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, SafeAreaView, ActivityIndicator, Animated } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../components/ToastHelper";
import { logout, profileRequest } from "../../redux/slices/authSlice";
import { RootState } from "../../redux/store";
import { Colors } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";

export default function Profile() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { user, token, loading } = useSelector((s: RootState) => s.auth);
  const isLoggedIn = !!user && !!token;

  // Animation Refs
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (token) {
      dispatch(profileRequest(token));
    }
  }, [token]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    showToast("success", "Logged Out", "You have successfully logged out.");
    router.replace("/login");
  };

  if (loading)
    return (
      <View style={[styles.center, { flex: 1 }]}>
        <ActivityIndicator size="large" color={Colors.white} />
      </View>
    );

  if (!isLoggedIn)
    return (
      <View style={[styles.center, { flex: 1 }]}>
        <Text style={styles.message}>Please login to view profile</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.replace("/login")}>
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.ScrollView
        contentContainerStyle={styles.container}
        style={{ transform: [{ translateY: slideAnim }] }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
        </View>

        {/* USER CARD */}
        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{user?.name?.[0]?.toUpperCase() || "U"}</Text>
            </View>
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.userName}>{user?.name || "N/A"}</Text>
            <Text style={styles.userEmail}>{user?.email || "N/A"}</Text>
          </View>
        </View>

        {/* ANALYTICS BUTTON */}
        <TouchableOpacity
          style={styles.analyticsButton}
          activeOpacity={0.8}
          onPress={() => router.push("/(drawer)/analytics_screen")}
        >
          <View style={styles.analyticsContent}>
            <View>
              <Text style={styles.analyticsTitle}>View Analytics</Text>
              <Text style={styles.analyticsSubtitle}>Track your progress & improvements</Text>
            </View>
            <Ionicons name="stats-chart" size={28} color={Colors.white} />
          </View>
        </TouchableOpacity>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.background} style={{ marginRight: 8 }} />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: 24,
    paddingBottom: 100, // Ensure enough scroll space
    flexGrow: 1, // Ensure it takes space
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  header: {
    marginTop: 10,
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    padding: 30,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  avatarContainer: {
    marginBottom: 20,
    shadowColor: Colors.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.border,
  },
  avatarInitials: {
    fontSize: 40,
    fontWeight: "bold",
    color: Colors.white,
  },
  infoBlock: {
    alignItems: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textGray,
  },

  // Analytics Button Styles
  analyticsButton: {
    backgroundColor: "#2563EB", // Brand Blue
    borderRadius: 20,
    padding: 20,
    marginBottom: 40,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  analyticsContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  analyticsTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  analyticsSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },

  message: {
    fontSize: 18,
    color: Colors.textGray,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: Colors.white,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  loginButtonText: {
    color: Colors.background,
    fontWeight: "bold",
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
  },
  logoutButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: "bold",
  },
});
