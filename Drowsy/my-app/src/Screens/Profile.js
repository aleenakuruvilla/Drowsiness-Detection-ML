import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ShowToast } from "../components/Toast.js";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const FormField = ({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  editable = true,
  keyboardType = "default",
}) => (
  <View style={styles.inputWrapper}>
    <View style={styles.inputGroup}>
      {icon}
      <TextInput
        style={styles.inputBox}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        editable={editable}
        keyboardType={keyboardType}
        placeholderTextColor="#999"
      />
    </View>
  </View>
);

function ProfileScreen() {
  const [userData, setUserData] = useState({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("********");
  const [newPassword, setNewPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      setEmail(userData.email || "");
      setCurrentPassword("********");
      setMobile(userData.mobile || "");
    }
  }, [userData]);

  const getData = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        ShowToast("error", "You're not logged in");
        navigation.navigate("Login");
        return;
      }

      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/userdata`,
        { token }
      );

      setUserData(res.data.data);
    } catch (err) {
      console.error("Error fetching data", err);
      ShowToast("error", "Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const validateFields = () => {
    let tempErrors = {};
    let isValid = true;

    if (!name.trim()) {
      tempErrors["name"] = "Name is required";
      isValid = false;
    } else if (!/^[A-Za-z]/.test(name.trim())) {
      tempErrors["name"] = "Name must start with a letter";
      isValid = false;
    }

    const mobileRegex = /^[789]\d{9}$/;
    if (!mobile.trim()) {
      tempErrors["mobile"] = "Mobile number is required";
      isValid = false;
    } else if (!mobileRegex.test(mobile)) {
      tempErrors["mobile"] =
        "Invalid mobile number (10 digits, start with 7, 8, or 9)";
      isValid = false;
    }

    if (showPasswordFields && newPassword) {
      if (newPassword.length < 8) {
        tempErrors["newPassword"] = "Password must be at least 8 characters";
        isValid = false;
      } else if (!/[A-Z]/.test(newPassword)) {
        tempErrors["newPassword"] =
          "Password must contain at least one uppercase letter";
        isValid = false;
      } else if (!/[0-9]/.test(newPassword)) {
        tempErrors["newPassword"] = "Password must contain at least one number";
        isValid = false;
      }
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleUpdate = async () => {
    if (validateFields()) {
      try {
        setIsLoading(true);
        const token = await AsyncStorage.getItem("token");

        const updateData = {
          token,
          name,
          mobile,
        };

        if (showPasswordFields && newPassword) {
          updateData.password = newPassword;
        }

        await axios.post(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/updateuser`,
          updateData
        );

        ShowToast("success", "Profile updated successfully!");

        if (showPasswordFields) {
          setNewPassword("");
          setShowPasswordFields(false);
        }

        navigation.navigate("Home");
      } catch (err) {
        console.error("Update error:", err);
        ShowToast("error", "Couldn't update the profile");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getData();
    setRefreshing(false);
  }, []);

  const togglePasswordFields = () => {
    setShowPasswordFields(!showPasswordFields);
    if (showPasswordFields) {
      setNewPassword("");
      setErrors({ ...errors, newPassword: null });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8a2be2" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={"height"} style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileImageContainer}>
          <Image
            source={{
              uri: "https://img.freepik.com/premium-vector/system-software-update-illustration-design-concept-illustration-websites-landing-pages-mobile-applications-posters-banners_108061-821.jpg?semt=ais_hybrid",
            }}
            style={styles.profileImage}
          />
        </View>

        <View style={styles.formContainer}>
          <FormField
            icon={
              <Ionicons
                name="person"
                size={20}
                color="#8a2be2"
                style={styles.icon}
              />
            }
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          <FormField
            icon={
              <MaterialIcons
                name="email"
                size={20}
                color="#8a2be2"
                style={styles.icon}
              />
            }
            placeholder="Email address"
            value={email}
            editable={false}
          />

          <FormField
            icon={
              <FontAwesome5
                name="lock"
                size={20}
                color="#8a2be2"
                style={styles.icon}
              />
            }
            placeholder="Current password"
            value={currentPassword}
            secureTextEntry={true}
            editable={false}
          />

          <TouchableOpacity
            style={styles.passwordToggleButton}
            onPress={togglePasswordFields}
          >
            <Text style={styles.passwordToggleText}>
              {showPasswordFields
                ? "Cancel Password Change"
                : "Change Password"}
            </Text>
          </TouchableOpacity>

          {showPasswordFields && (
            <>
              <FormField
                icon={
                  <FontAwesome5
                    name="key"
                    size={20}
                    color="#8a2be2"
                    style={styles.icon}
                  />
                }
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={true}
              />
              {errors.newPassword && (
                <Text style={styles.errorText}>{errors.newPassword}</Text>
              )}
            </>
          )}

          <FormField
            icon={
              <Ionicons
                name="call"
                size={20}
                color="#8a2be2"
                style={styles.icon}
              />
            }
            placeholder="Enter your mobile number"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="numeric"
          />
          {errors.mobile && (
            <Text style={styles.errorText}>{errors.mobile}</Text>
          )}

          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdate}
            disabled={isLoading}
          >
            <LinearGradient
              colors={["#8a2be2", "#9400d3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Updating..." : "Update Profile"}
              </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    width: "100%",
    overflow: "hidden",
  },
  headerGradient: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  profileImageContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  profileImage: {
    height: 200,
    width: "85%",
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputGroup: {
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
  icon: {
    marginRight: 12,
  },
  inputBox: {
    flex: 1,
    color: "#333",
    fontSize: 16,
    paddingVertical: 4,
  },
  errorText: {
    color: "#e53935",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 16,
  },
  updateButton: {
    marginTop: 20,
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
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  passwordToggleButton: {
    alignItems: "flex-end",
    marginBottom: 16,
    marginTop: -8,
  },
  passwordToggleText: {
    color: "#8a2be2",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default ProfileScreen;
