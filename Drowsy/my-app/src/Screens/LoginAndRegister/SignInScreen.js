import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { ShowToast } from "../../components/Toast.js";
import { useNavigation, CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import { useUser } from "../../context/UserContext.js";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function SignInScreen() {
  const { setUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const navigation = useNavigation();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (password) => {
    if (!password.trim()) {
      setPasswordError("Password is required");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSignIn = async () => {
    // Validate inputs
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);
    ShowToast("info", "Processing your sign-in...");

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    try {
      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/login-user`,
        { email: trimmedEmail, password: trimmedPassword }
      );

      if (res.data.status === "Ok") {
        try {
          const fcmToken = await messaging().getToken();
          if (!fcmToken) {
            ShowToast("error", "Unable to get notification token");
            setIsLoading(false);
            return;
          }

          const fcmUpdateRes = await axios.post(
            `${process.env.EXPO_PUBLIC_BACKEND_URL}/update-fcm-token`,
            { email: trimmedEmail, fcmToken }
          );

          if (fcmUpdateRes.data.status !== "Ok") {
            ShowToast("error", "Something went wrong with notification setup");
            setIsLoading(false);
            return;
          }

          const userData = { ...res.data.user, fcmToken };
          ShowToast("success", "Welcome back!");
          setUser(userData);
          await AsyncStorage.setItem("token", res.data.token);
          await AsyncStorage.setItem("user", JSON.stringify(userData));
          await AsyncStorage.setItem("userType", userData.role);
        } catch (err) {
          ShowToast("error", "Login successful but notification setup failed");
          console.error(err);
        }
      } else {
        ShowToast("error", res.data.message || "Login failed");
      }
    } catch (err) {
      ShowToast("error", "Invalid credentials");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpNavigation = () => {
    navigation.navigate("SignUp");
  };

  const handleForgotPassword = () => {};

  return (
    <KeyboardAvoidingView behavior={"height"} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <View
              style={[
                styles.inputWrapper,
                emailError ? styles.inputError : null,
              ]}
            >
              <MaterialIcons
                name="email"
                size={20}
                color="#8a2be2"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) validateEmail(text);
                }}
                placeholder="Email Address"
                placeholderTextColor="#999"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <View
              style={[
                styles.inputWrapper,
                passwordError ? styles.inputError : null,
              ]}
            >
              <Ionicons
                name="lock-closed"
                size={20}
                color="#8a2be2"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) validatePassword(text);
                }}
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#8a2be2"
                />
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            <LinearGradient
              colors={["#8a2be2", "#9400d3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.signInText}>Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 30,
  },
  logo: {
    width: 200,
    height: 150,
    borderRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#6200ee",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#e53935",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: "#333",
    fontSize: 16,
    paddingVertical: 4,
  },
  passwordToggle: {
    padding: 4,
  },
  errorText: {
    color: "#e53935",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#8a2be2",
    fontSize: 14,
    fontWeight: "600",
  },
  signInButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#6200ee",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  gradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  signInText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  socialButtonsContainer: {
    marginVertical: 24,
    alignItems: "center",
  },
  orText: {
    color: "#666",
    fontSize: 14,
    marginVertical: 16,
    fontWeight: "600",
  },
  signUpContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  signUpText: {
    color: "#666",
    fontSize: 14,
  },
  signUpHighlight: {
    color: "#8a2be2",
    fontWeight: "bold",
  },
});
