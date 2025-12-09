import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { useSelector } from "react-redux";
import { startInterview } from "../../api/interview";
import { RootState } from "../../redux/store";

interface TokenPayload {
  id: string;
  name: string;
  email: string;
  iat: number;
  exp: number;
}

const SelectInterview: React.FC = () => {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [totalQuestions, setTotalQuestions] = useState("5");

  const auth = useSelector((state: RootState) => state.auth);
  const userId = auth.token
    ? jwtDecode<TokenPayload>(auth.token).id
    : undefined;

  // Auto-redirect if not logged in
  useEffect(() => {
    if (!userId) {
      console.log("User not logged in, navigating to login");
      router.replace("/login");
    }
  }, [userId]);

  const handleStart = async () => {
    if (!role || !totalQuestions) {
      return Alert.alert("Error", "Please fill all fields");
    }

    try {
      const res = await startInterview({
        role,
        totalQuestions: Number(totalQuestions),
        userId,
        isAnonymous: !userId,
      });

      if (res?.success) {
        router.push({
          pathname: "/interview_chat",
          params: {
            sessionId: res.sessionId,
            role,
            totalQuestions: Number(totalQuestions),
          },
        });
        return;
      }

      Alert.alert("Error", res?.message || "Failed to start interview");

      if (res?.message?.includes("Free interview already used")) {
        console.log("Free session already used, auto-redirecting to login");
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

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Role / Interview Type</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter role"
        value={role}
        onChangeText={setRole}
      />

      <Text style={styles.label}>Number of Questions</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter number of questions"
        keyboardType="numeric"
        value={totalQuestions}
        onChangeText={setTotalQuestions}
      />

      <Button title="Start Interview" onPress={handleStart} />
    </View>
  );
};

export default SelectInterview;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  label: { fontSize: 16, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 20,
    padding: 10,
    borderRadius: 5,
  },
});
