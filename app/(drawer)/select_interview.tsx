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
  const [checkedAuth, setCheckedAuth] = useState(false);

  const auth = useSelector((state: RootState) => state.auth);

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

  // Wait until auth is checked
  if (!checkedAuth) return null;

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
