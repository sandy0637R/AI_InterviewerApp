import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../components/ToastHelper"; // adjust path
import { logout, profileRequest } from "../../redux/slices/authSlice";
import { RootState } from "../../redux/store";

export default function Profile() {
  const dispatch = useDispatch();
  const { user, token, loading } = useSelector((s: RootState) => s.auth);
  const isLoggedIn = !!user && !!token;

  useEffect(() => {
    if (token) {
      dispatch(profileRequest(token));
    }
  }, [token]);

  const handleLogout = () => {
    dispatch(logout());
    showToast("success", "Logged Out", "You have successfully logged out.");
  };

  if (!isLoggedIn)
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Please login</Text>
      </View>
    );

  if (loading)
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.text}>Name: {user?.name}</Text>
      <Text style={styles.text}>Email: {user?.email}</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
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
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  message: {
    fontSize: 20,
    color: "#555",
  },
  button: {
    marginTop: 30,
    width: "100%",
    height: 50,
    backgroundColor: "#f44336",
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
