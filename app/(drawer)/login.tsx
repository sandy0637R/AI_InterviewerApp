import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../app-example/components/ToastHelper"; // adjust path
import { loginRequest } from "../../redux/slices/authSlice";
import { RootState } from "../../redux/store";

export default function Login() {
  const dispatch = useDispatch();
  const { loading, user, error } = useSelector((s: RootState) => s.auth);
  const isLoggedIn = !!user; // compute dynamically

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = () => {
    dispatch(loginRequest({ email, password }));
  };

  // Handle success or error
  useEffect(() => {
    if (isLoggedIn) {
      showToast("success", "Login Successful", "Welcome back!");
      setEmail("");
      setPassword("");
    }
    if (error) {
      showToast("error", "Login Failed", error);
    }
  }, [isLoggedIn, error]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={submit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Loading..." : "Login"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f2f2f2",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
