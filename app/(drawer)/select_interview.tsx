import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from "react-native";
import { useSelector } from "react-redux";
import { startInterview } from "../../api/interview";
import { RootState } from "../../redux/store";
import { Colors } from "../../constants/colors"; // Access colors
import { Ionicons } from "@expo/vector-icons";

interface TokenPayload {
  id: string;
}

const COMMON_ROLES = [
  "React Developer",
  "Node.js Backend",
  "Python Developer",
  "Data Scientist",
  "Product Manager",
  "UI/UX Designer",
];

const QUESTION_COUNTS = [5, 10, 15, 20];

const SelectInterview: React.FC = () => {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [totalQuestions, setTotalQuestions] = useState<number>(5);
  const [checkedAuth, setCheckedAuth] = useState(false);

  const auth = useSelector((state: RootState) => state.auth);
  const windowWidth = Dimensions.get("window").width;

  // Decode token safely
  let userId: string | undefined;
  try {
    if (auth.token) {
      const decoded = jwtDecode<TokenPayload>(auth.token);
      userId = decoded.id;
    }
  } catch (err) {
    userId = undefined;
  }

  // Check auth after mount
  useEffect(() => {
    if (!userId) {
      router.replace("/login");
    } else {
      setCheckedAuth(true);
    }
  }, [userId, router]);

  const handleStart = async () => {
    const finalRole = customRole.trim() || role;

    if (!finalRole) {
      return Alert.alert("Required", "Please select or type a job role.");
    }

    // Role Validation: At least 2 chars, alphanumeric + spaces only
    if (finalRole.length < 2) {
      return Alert.alert("Invalid Role", "Role name is too short. Please enter at least 2 characters.");
    }

    // Allow basic chars, dots (Node.js), and spaces. Reject random symbols.
    const roleRegex = /^[a-zA-Z0-9\s.]+$/;
    if (!roleRegex.test(finalRole)) {
      return Alert.alert("Invalid Role", "Please enter a valid role name (letters, numbers, and spaces only).");
    }

    try {
      const res = await startInterview({
        role: finalRole,
        totalQuestions,
        userId,
        isAnonymous: !userId,
      });

      if (res?.success) {
        router.push({
          pathname: "/interview_chat",
          params: {
            sessionId: res.sessionId,
            role: finalRole,
            totalQuestions,
          },
        });
        return;
      }

      Alert.alert("Error", res?.message || "Failed to start interview");

      if (res?.message?.includes("Free interview already used")) {
        router.replace("/login");
      }
    } catch (error: any) {
      const errMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Server error. Please try again.";

      Alert.alert("Error", errMessage);

      if (errMessage.includes("Free interview already used")) {
        router.replace("/login");
      }
    }
  };

  if (!checkedAuth) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>New Interview</Text>
            <Text style={styles.subtitle}>Customize your session settings</Text>
          </View>

          {/* SECTION 1: ROLE SELECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Role</Text>
            <View style={styles.roleChipsContainer}>
              {COMMON_ROLES.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.chip,
                    role === r && !customRole ? styles.chipSelected : styles.chipUnselected,
                  ]}
                  onPress={() => {
                    setRole(r);
                    setCustomRole(""); // Clear custom if picking preset
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      role === r && !customRole ? styles.chipTextSelected : styles.chipTextUnselected,
                    ]}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.orText}>- OR -</Text>

            <TextInput
              style={[
                styles.input,
                customRole ? styles.inputActive : {}
              ]}
              placeholder="Type a custom role (e.g. 'Golang Architect')"
              placeholderTextColor={Colors.textGray}
              value={customRole}
              onChangeText={(text) => {
                setCustomRole(text);
                if (text) setRole(""); // Clear preset if typing custom
              }}
            />
          </View>

          {/* SECTION 2: QUESTION COUNT */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Number of Questions</Text>
            <View style={styles.countContainer}>
              {QUESTION_COUNTS.map((count) => (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.countButton,
                    totalQuestions === count ? styles.countButtonSelected : styles.countButtonUnselected,
                    { width: (windowWidth - 60) / 4 } // Distribute evenly
                  ]}
                  onPress={() => setTotalQuestions(count)}
                >
                  <Text
                    style={[
                      styles.countText,
                      totalQuestions === count ? styles.countTextSelected : styles.countTextUnselected,
                    ]}
                  >
                    {count}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* START BUTTON */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
              <Ionicons name="play" size={24} color={Colors.background} style={{ marginRight: 8 }} />
              <Text style={styles.startButtonText}>Start Interview</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SelectInterview;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textGray,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.white,
    marginBottom: 16,
  },
  roleChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  chipUnselected: {
    backgroundColor: Colors.grey4,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.white,
    borderColor: Colors.white,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  chipTextUnselected: {
    color: Colors.textGray,
  },
  chipTextSelected: {
    color: Colors.background, // Contrast against white chip
  },
  orText: {
    color: Colors.grey3,
    textAlign: "center",
    marginVertical: 16,
    fontSize: 12,
    fontWeight: "600",
  },
  input: {
    backgroundColor: Colors.grey4,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    borderRadius: 12,
    color: Colors.white,
    fontSize: 16,
  },
  inputActive: {
    borderColor: Colors.white,
  },
  countContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  countButton: {
    aspectRatio: 1, // Square buttons
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  countButtonUnselected: {
    backgroundColor: Colors.grey4,
    borderColor: Colors.border,
  },
  countButtonSelected: {
    backgroundColor: Colors.white,
    borderColor: Colors.white,
  },
  countText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  countTextUnselected: {
    color: Colors.textGray,
  },
  countTextSelected: {
    color: Colors.background,
  },
  footer: {
    marginTop: 20,
  },
  startButton: {
    backgroundColor: Colors.white,
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.white,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  startButtonText: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: "bold",
  },
});
