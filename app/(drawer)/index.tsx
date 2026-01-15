import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Easing,
} from "react-native";

const { width } = Dimensions.get("window");

const Home = () => {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [pulseAnim] = useState(new Animated.Value(1));

  // Ambient Animations
  const orb1Y = useRef(new Animated.Value(0)).current;
  const orb2Y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();

    // Pulsing Button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();

    // Orb 1 Animation (Playful Float)
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Y, {
          toValue: -30,
          duration: 4000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(orb1Y, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    ).start();

    // Orb 2 Animation (Counter Float)
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Y, {
          toValue: 40,
          duration: 5000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(orb2Y, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    ).start();

  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* AMBIENT BACKGROUND ORBS */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Animated.View style={[styles.orb, styles.orb1, { transform: [{ translateY: orb1Y }] }]} />
        <Animated.View style={[styles.orb, styles.orb2, { transform: [{ translateY: orb2Y }] }]} />
      </View>

      <View style={styles.content}>
        <Animated.View style={[styles.heroSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.iconCircle}>
            <Ionicons name="mic-outline" size={64} color={Colors.white} />
          </View>

          <Text style={styles.tagline}>ELEVATE YOUR CAREER</Text>
          <Text style={styles.title}>AI Interviewer</Text>
          <Text style={styles.description}>
            Master your interview skills with real-time AI feedback and personalized coaching.
          </Text>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: pulseAnim }], width: "100%", alignItems: "center" }}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push("/(drawer)/select_interview")}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>Start New Interview</Text>
            <Ionicons name="arrow-forward" size={24} color={Colors.background} />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Decorative Background Element */}
      <View style={styles.decorCircle} pointerEvents="none" />
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    position: 'relative',
    overflow: 'hidden' // Clip orbs
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.3,
    zIndex: 0,
  },
  orb1: {
    width: 300,
    height: 300,
    backgroundColor: Colors.primary,
    top: -50,
    left: -80,
    opacity: 0.2
  },
  orb2: {
    width: 200,
    height: 200,
    backgroundColor: "#2563EB", // Blue accent
    bottom: 150,
    right: -50,
    opacity: 0.15
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 50,
    paddingTop: 80, // Space for header
    zIndex: 10, // Above orbs
  },
  heroSection: {
    alignItems: "center",
    marginTop: 60,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  tagline: {
    color: "#FFD700", // Gold
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: 10,
    textTransform: 'uppercase'
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: Colors.white,
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.textGray,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  startButton: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 50,
    alignItems: "center",
    gap: 10,
    width: "100%",
    justifyContent: "center",
    shadowColor: Colors.white,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  startButtonText: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: "bold",
  },
  decorCircle: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primary,
    opacity: 0.2,
    zIndex: -1
  },
});