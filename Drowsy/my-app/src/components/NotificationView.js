import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
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
      console.error("Phone number not available.");
    }
  };

  const handleLocation = () => {
    setViewNotification(false);
    navigation.navigate('LocationView', { target: senderData })
  }

  const findSenderData = async () => {
    try {
      setLoading(true);
      const senderRes = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/get-user-details/${sender.senderId}`,
      );
      console.log("test ", senderRes);
      setSenderData(senderRes.data.data);
      setLoading(false);
    } catch (error) { 
      console.error("Failed to fetch sender data ", error);
    }
  };

  const handleConfirmation = async (userId, status) => {
    try {
      if(requestLoading) {
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
        },
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

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#e75f62" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      { senderData && (
      <>
      <Image source={{ uri: `${process.env.EXPO_PUBLIC_BACKEND_URL}/${senderData.profileImage}` }} style={styles.image} />
          <Text style={styles.name}>{senderData.name}</Text>
          <Text style={styles.subText}>{senderData.gender}</Text>
          {requestLoading ? (
            <View style={styles.requestLoading}>
              <ActivityIndicator size="large" color="#e75f62" />
            </View>
          ) : showCall ? (
            <View style={{width: "100%"}}>
              <TouchableOpacity
                onPress={() => handleCall()}
                style={{ width: "100%", alignItems: "center" }}
              >
                <View
                  style={{
                    ...styles.confirmationContainer,
                    backgroundColor: "#5dbea3",
                  }}
                >
                  <Text style={styles.buttonText}>Call Now</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleLocation()}
                style={{ width: "100%", alignItems: "center" }}
              >
                <View
                  style={{
                    ...styles.confirmationContainer,
                    backgroundColor: "#5dbea3",
                  }}
                >
                  <Text style={styles.buttonText}>Location</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : showRejectMsg ? (
            <View style={styles.errorMsgContainer}>
              <Text style={styles.errorText}>
                Unfortunately, {senderData.name} is unable to support your
                request at this time. Keep reaching out for help!
              </Text>
            </View>
          ) : confirmation === "accepted" ? (
            <View
              style={{
                ...styles.confirmationContainer,
                backgroundColor: "#5dbea3",
              }}
            >
              <Text style={styles.buttonText}>Accepted</Text>
            </View>
          ) : confirmation === "rejected" ? (
            <View style={styles.confirmationContainer}>
              <Text style={styles.buttonText}>Rejected</Text>
            </View>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={() => handleConfirmation(sender.senderId, false)}
              >
                <View style={styles.buttonContainer}>
                  <Text style={styles.buttonText}>Reject</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleConfirmation(sender.senderId, true)}
              >
                <View
                  style={{
                    ...styles.buttonContainer,
                    backgroundColor: "#5dbea3",
                  }}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: "auto",
    bottom: "25%",
    width: "80%",
    height: "50%",
    padding: "20",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 20,
    backgroundColor: "white",
  },
  image: {
    height: 120,
    width: 120,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: "#e75f62",
    marginBottom: 10,
  },
  name: {
    fontSize: 30,
    fontWeight: "600",
  },
  subText: {
    fontSize: 22,
  },
  buttonRow: {
    flexDirection: "row",
    width: "75%",
    justifyContent: "space-between",
  },
  buttonContainer: {
    width: 110,
    padding: 15,
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e75f62",
    borderRadius: 10,
  },
  confirmationContainer: {
    width: "80%",
    padding: 15,
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e75f62",
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "500",
  },
  greenLight: {
    width: 10,
    height: 10,
    borderRadius: 50,
    backgroundColor: "green",
    marginRight: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  requestLoading: {
    marginTop: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  errorMsgContainer: {
    width: "85%",
    padding: 15,
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "red",
    borderRadius: 10,
  },
  errorText: {
    fontSize: 12,
    color: "white",
    fontWeight: "500",
  },
});
