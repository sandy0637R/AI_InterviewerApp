import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const Home = () => {
  const router = useRouter();

  // Animation Values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance Animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse Animation for Button
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Background Decor */}
      <View style={styles.decorCircle} />

      <View style={styles.container}>
        {/* HERO SECTION */}
        <Animated.View
          style={[
            styles.hero,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="mic-outline" size={80} color={Colors.background} />
          </View>

          <Text style={styles.title}>AI Interviewer</Text>
          <Text style={styles.tagline}>ELEVATE YOUR CAREER</Text>

          <View style={styles.divider} />

          <Text style={styles.description}>
            Master your interview skills with real-time AI feedback.
            Experience a new era of preparation.
          </Text>
        </Animated.View>

        {/* ACTIONS */}
        <Animated.View
          style={[
            styles.actions,
            {
              opacity: fadeAnim,
              transform: [{ scale: buttonScale }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.startButton}
            activeOpacity={0.8}
            onPress={() => router.push("/(drawer)/select_interview")}
          >
            <View style={styles.btnContent}>
              <Text style={styles.startButtonText}>START INTERVIEW</Text>
              <Ionicons name="arrow-forward-circle" size={28} color={Colors.background} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
    paddingBottom: 50,
    zIndex: 1,
  },
  decorCircle: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primary,
    opacity: 0.5,
  },
  hero: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    shadowColor: Colors.white,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    color: Colors.white,
    textAlign: "center",
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFD700", // Gold accent
    letterSpacing: 4,
    marginTop: 10,
    marginBottom: 20,
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: Colors.textGray,
    textAlign: "center",
    lineHeight: 26,
    maxWidth: "80%",
  },
  actions: {
    width: "100%",
    alignItems: "center",
  },
  startButton: {
    backgroundColor: Colors.white,
    width: "100%",
    paddingVertical: 20,
    borderRadius: 30,
    shadowColor: Colors.white,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  startButtonText: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1,
  },
});