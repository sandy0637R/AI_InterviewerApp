import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { startInterview } from "../../api/interview";

const SelectInterview: React.FC = () => {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [totalQuestions, setTotalQuestions] = useState("5");

  const handleStart = async () => {
    if (!role || !totalQuestions) return Alert.alert("Please fill all fields");

    try {
      const res = await startInterview({
        role,
        totalQuestions: Number(totalQuestions),
      });

      if (res.success) {
        router.push({
          pathname: "/interview_chat",
          params: { sessionId: res.sessionId, role, totalQuestions: Number(totalQuestions) },
        });
      } else {
        Alert.alert("Error", "Failed to start interview");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Server error");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Role / Interview Type</Text>
      <TextInput style={styles.input} placeholder="Enter role" value={role} onChangeText={setRole} />

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
  input: { borderWidth: 1, borderColor: "#ccc", marginBottom: 20, padding: 10, borderRadius: 5 },
});
