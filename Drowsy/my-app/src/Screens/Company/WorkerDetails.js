import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
} from "react-native";
import axios from "axios";
import { MaterialIcons, FontAwesome, Ionicons } from "@expo/vector-icons";
import * as SMS from "expo-sms";
import Modal from "react-native-modal";
import { useUser } from "../../context/UserContext";

function WorkerDetails({ route, navigation }) {
  const { user } = route.params;
  const { workers, setWorkers } = useUser();
  const [userData, setUserData] = useState(null);
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: "User Profile",
      headerTitleStyle: {
        fontWeight: "700",
        color: "#FFF",
      },
      headerLeft: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: "transparent",
      },
    });

    const fetchUserDetails = async () => {
      try {
        const res = await axios.get(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/get-user-details/${user._id}`
        );
        setUserData(res.data.data);
        setNumber(res.data.data.mobile);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user details:", error);
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [user._id, navigation]);

  const generateRandomNumber = () => {
    return Math.floor(100 + Math.random() * 900);
  };

  const sendSMS = async () => {
    const randomNumber = generateRandomNumber();
    const newPassword = `Car${randomNumber}`;
    const message = `Account verified, Your password is ${newPassword}`;

    try {
      await SMS.sendSMSAsync(number, message);
      const updatePasswordResponse = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/update-password`,
        {
          userId: user._id,
          newPassword,
        }
      );

      if (updatePasswordResponse.data.status === "ok") {
        // Update local state to reflect verification
        const updatedUserData = { ...userData, password: newPassword };
        setUserData(updatedUserData);
        setWorkers(prevWorkers => 
          prevWorkers.map(worker => 
            worker._id === user._id ? updatedUserData : worker
          )
        );
        alert("Account verified successfully");
      } else {
        alert("Message sent but failed to update password.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred");
    }
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#5A42E5" />
        <ActivityIndicator size="large" color="#5A42E5" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5A42E5" />

      <View style={styles.headerBackground} />

      {userData && (
        <View style={styles.content}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: `${process.env.EXPO_PUBLIC_BACKEND_URL}/${userData?.profileImage}`,
                }}
                style={styles.avatarImage}
              />
            </View>
            <Text style={styles.userName}>{userData.name}</Text>
            {userData.password ? (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Contact Information</Text>

            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="email" size={20} color="#5A42E5" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailText}>{userData.email}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <FontAwesome name="phone" size={20} color="#5A42E5" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailText}>{userData.mobile}</Text>
              </View>
            </View>

            {userData.image && (
              <View style={styles.documentSection}>
                <Text style={styles.sectionTitle}>Documents</Text>
                <TouchableOpacity
                  style={styles.documentButton}
                  onPress={toggleModal}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="description" size={20} color="#5A42E5" />
                  <Text style={styles.documentButtonText}>
                    View Identification
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#5A42E5" />
                </TouchableOpacity>
              </View>
            )}

            {!userData.password && (
              <View style={styles.actionSection}>
                <Text style={styles.sectionTitle}>Account Status</Text>
                <Text style={styles.actionDescription}>
                  This account needs to be verified. Verification will send a
                  password to the user's phone.
                </Text>
                <TouchableOpacity
                  style={styles.verifyButton}
                  onPress={sendSMS}
                  activeOpacity={0.8}
                >
                  <Ionicons name="shield-checkmark" size={20} color="#FFF" />
                  <Text style={styles.verifyButtonText}>Verify Account</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        backdropOpacity={0.7}
        animationIn="fadeIn"
        animationOut="fadeOut"
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Identification Document</Text>
            <TouchableOpacity onPress={toggleModal}>
              <Ionicons name="close-circle" size={28} color="#5A42E5" />
            </TouchableOpacity>
          </View>
          <Image
            source={{
              uri: `${process.env.EXPO_PUBLIC_BACKEND_URL}/${userData?.image}`,
            }}
            style={styles.fullImage}
          />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FD",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FD",
  },
  loadingText: {
    marginTop: 10,
    color: "#5A42E5",
    fontSize: 16,
    fontWeight: "500",
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: "#5A42E5",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileHeader: {
    marginTop: 100,
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: {
    marginTop: "10%",
    fontSize: 24,
    fontWeight: "700",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginTop: 8,
  },
  verifiedText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F5",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F0F1FE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  documentSection: {
    marginTop: 24,
  },
  documentButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F1FE",
    borderRadius: 12,
    padding: 16,
    justifyContent: "space-between",
  },
  documentButtonText: {
    flex: 1,
    color: "#5A42E5",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  actionSection: {
    marginTop: 24,
  },
  actionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  verifyButton: {
    backgroundColor: "#5A42E5",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  verifyButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  modal: {
    margin: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },
  fullImage: {
    width: "100%",
    height: 350,
    borderRadius: 12,
    resizeMode: "contain",
  },
});

export default WorkerDetails;
