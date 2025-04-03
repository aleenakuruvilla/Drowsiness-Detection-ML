import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Linking,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import ShowToast from "../components/Toast";
import { useUser } from "../context/UserContext";
import { useNavigation } from "@react-navigation/native";

export default function NotificationView({ sender, setViewNotification }) {
  const navigation = useNavigation();
  const { user } = useUser();
  const [senderData, setSenderData] = useState();
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [showRejectMsg, setShowRejectMsg] = useState(false);
  const [showCall, setShowCall] = useState(false);

  useEffect(() => {
    findSenderData();

    if (sender.confirmation === "accepted") {
      setShowCall(true);
    } else if (sender.confirmation === "rejected") {
      setShowRejectMsg(true);
    }
  }, []);

  const handleCall = () => {
    const phoneNumber = senderData.mobile;
    if (phoneNumber) {
      Linking.openURL(`tel:+91 ${phoneNumber}`);
    } else {
      ShowToast("error", "Phone number not available");
    }
  };

  const handleLocation = () => {
    setViewNotification(false);
    navigation.navigate("LocationView", { target: senderData });
  };

  const findSenderData = async () => {
    try {
      setLoading(true);
      const senderRes = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/get-user-details/${sender.senderId}`
      );
      setSenderData(senderRes.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch sender data ", error);
      ShowToast("error", "Failed to load user information");
      setLoading(false);
    }
  };

  const handleConfirmation = async (userId, status) => {
    try {
      if (requestLoading) {
        return;
      }
      setRequestLoading(true);

      const token = await AsyncStorage.getItem("token");
      const recipientToken = senderData.fcmToken;

      if (!recipientToken) {
        throw new Error("Token not found");
      }

      const acceptMessage = {
        targetToken: recipientToken,
        title: "Driving Request Accepted",
        body: `🎉 Your request has been accepted! ${user.name} is ready to support. Tap to coordinate further.`,
        senderId: `${user._id}`,
        userId: `${userId}`,
        profileImage: `${user.profileImage}`,
        confirmation: "accepted",
      };

      const rejectMessage = {
        targetToken: recipientToken,
        title: "Driving Request Rejected",
        body: `❌ Unfortunately, ${user.name} is unable to support your request at this time. Keep reaching out for help!`,
        senderId: `${user._id}`,
        userId: `${userId}`,
        profileImage: `${user.profileImage}`,
        confirmation: "rejected",
      };

      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/send-notification`,
        status ? acceptMessage : rejectMessage,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status !== 200) {
        throw new Error("FCM send service responded code: ", res.status);
      }

      if (status) {
        setConfirmation("accepted");
      } else {
        setConfirmation("rejected");
      }
    } catch (error) {
      ShowToast("error", "Request failed to send!");
      console.error("Error sending notification:", error);
    } finally {
      setRequestLoading(false);
    }
  };

  const handleClose = () => {
    setViewNotification(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#5dbea3" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.modalOverlay}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close-circle" size={30} color="#999" />
        </TouchableOpacity>

        {senderData && (
          <View style={styles.contentContainer}>
            <View style={styles.profileSection}>
              <Image
                source={{
                  uri: `${process.env.EXPO_PUBLIC_BACKEND_URL}/${senderData.profileImage}`,
                }}
                style={styles.image}
              />
              <View style={styles.badgeContainer}>
                <Ionicons name="car-outline" size={16} color="white" />
              </View>

              <Text style={styles.name}>{senderData.name}</Text>
              <View style={styles.infoChip}>
                <Text style={styles.infoText}>{senderData.gender}</Text>
              </View>

              {sender.targetLocation && (
                <View style={styles.destinationContainer}>
                  <View style={styles.destinationIconContainer}>
                    <Ionicons name="location" size={16} color="white" />
                  </View>
                  <Text style={styles.destinationText}>
                    {sender.targetLocation}
                  </Text>
                </View>
              )}
            </View>

            {requestLoading ? (
              <View style={styles.requestLoading}>
                <ActivityIndicator size="large" color="#5dbea3" />
                <Text style={styles.loadingText}>Processing request...</Text>
              </View>
            ) : showCall ? (
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  onPress={handleCall}
                  style={styles.actionButton}
                >
                  <Ionicons name="call" size={20} color="white" />
                  <Text style={styles.actionButtonText}>Call Now</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleLocation}
                  style={[styles.actionButton, { backgroundColor: "#5b7eea" }]}
                >
                  <Ionicons name="location" size={20} color="white" />
                  <Text style={styles.actionButtonText}>View Location</Text>
                </TouchableOpacity>
              </View>
            ) : showRejectMsg ? (
              <View style={styles.messageContainer}>
                <Ionicons name="alert-circle" size={30} color="#e75f62" />
                <Text style={styles.messageText}>
                  Unfortunately, {senderData.name} is unable to support your
                  request at this time. Keep reaching out for help!
                </Text>
              </View>
            ) : confirmation === "accepted" ? (
              <View style={styles.confirmationContainer}>
                <Ionicons name="checkmark-circle" size={40} color="#5dbea3" />
                <Text style={styles.confirmationText}>Request Accepted</Text>
              </View>
            ) : confirmation === "rejected" ? (
              <View style={styles.confirmationContainer}>
                <Ionicons name="close-circle" size={40} color="#e75f62" />
                <Text style={styles.confirmationText}>Request Rejected</Text>
              </View>
            ) : (
              <View style={styles.decisionContainer}>
                <Text style={styles.promptText}>
                  Would you like to help {senderData.name} with their driving
                  request?
                </Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    onPress={() => handleConfirmation(sender.senderId, false)}
                    style={styles.rejectButton}
                  >
                    <Ionicons name="close" size={20} color="white" />
                    <Text style={styles.buttonText}>Decline</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleConfirmation(sender.senderId, true)}
                    style={styles.acceptButton}
                  >
                    <Ionicons name="checkmark" size={20} color="white" />
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    borderRadius: 24,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    position: "relative",
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    right: 15,
    top: 15,
    zIndex: 5,
  },
  contentContainer: {
    padding: 25,
    alignItems: "center",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    height: 100,
    width: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  badgeContainer: {
    position: "absolute",
    right: -5,
    top: 10,
    backgroundColor: "#5dbea3",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
    marginBottom: 5,
  },
  infoChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f4f4f4",
    borderRadius: 20,
    marginTop: 5,
  },
  infoText: {
    fontSize: 14,
    color: "#555",
  },
  decisionContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  promptText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginTop: 10,
  },
  rejectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e75f62",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "48%",
  },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5dbea3",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "48%",
  },
  buttonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
    marginLeft: 5,
  },
  loadingContainer: {
    padding: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  requestLoading: {
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
  },
  actionButtonsContainer: {
    width: "100%",
    marginTop: 15,
  },
  actionButton: {
    flexDirection: "row",
    backgroundColor: "#5dbea3",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  messageContainer: {
    backgroundColor: "#fff8f8",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ffe8e8",
  },
  messageText: {
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },
  confirmationContainer: {
    alignItems: "center",
    padding: 20,
  },
  confirmationText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "600",
  },
  destinationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff8f0",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ffe0c0",
  },
  destinationIconContainer: {
    backgroundColor: "#e75f62",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  destinationText: {
    fontSize: 14,
    color: "#e75f62",
    fontWeight: "600",
  },
});
