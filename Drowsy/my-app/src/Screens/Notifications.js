import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import database from "@react-native-firebase/database";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../context/UserContext";
import NotificationView from "../components/NotificationView";
import { useNavigation } from "@react-navigation/native";
import ShowToast from "../components/Toast";

const Notifications = () => {
  const { user } = useUser();
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewNotification, setViewNotification] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [senderData, setSenderData] = useState();
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [targetLocation, setTargetLocation] = useState("");

  useEffect(() => {
    fetchNotifications();
    const notificationsRef = database().ref(`notifications/${user._id}`);
    notificationsRef.on("value", fetchNotifications);
    return () => {
      notificationsRef.off("value", fetchNotifications);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const snapshot = await database()
        .ref(`notifications/${user._id}`)
        .orderByChild("timestamp")
        .once("value");
      if (snapshot.exists()) {
        const notificationsData = snapshot.val();
        const filteredNotifications = Object.values(notificationsData).sort(
          (a, b) => b.timestamp - a.timestamp
        );
        setNotifications(filteredNotifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const notificationTime = (sendTimestamp) => {
    const sendTimeObj = new Date(sendTimestamp);
    const currDate = new Date();
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    const sendTime = sendTimeObj.toLocaleTimeString([], options);
    const sendDate = sendTimeObj.toLocaleDateString();
    if (currDate.toLocaleDateString() !== sendDate) {
      return sendDate;
    } else {
      return sendTime;
    }
  };

  const handleNotification = (item) => {
    if (!item.senderId) {
      setSelectedNotification(item);
      setShowLocationModal(true);
    } else {
      setViewNotification(true);
      setSenderData(item);
    }
  };

  const handleLocationSubmit = () => {
    if (!targetLocation.trim()) {
      ShowToast("error", "Please enter your destination location");
      return;
    }
    setShowLocationModal(false);

    const locationData = targetLocation;
    setTargetLocation("");
    navigation.navigate("DriverList", {
      item: selectedNotification,
      targetLocation: locationData,
    });
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleNotification(item)}>
      <View style={styles.notificationBoxContainer}>
        {item.profileImage ? (
          <Image
            source={{
              uri: `${process.env.EXPO_PUBLIC_BACKEND_URL}/${item.profileImage}`,
            }}
            style={styles.image}
          />
        ) : (
          <View style={[styles.image, styles.iconContainer]}>
            <Ionicons name="notifications" size={24} color="#e75f62" />
          </View>
        )}
        <View style={styles.notificationItem}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.time}>{notificationTime(item.timestamp)}</Text>
          </View>
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            style={styles.messageText}
          >
            {item.message}
          </Text>
          {item.targetLocation && (
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={14} color="#e75f62" />
              <Text style={styles.locationText}>
                Destination: {item.targetLocation}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={"large"} color="#e75f62" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>
            You have no new notifications at the moment.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal visible={viewNotification} animationType="fade" transparent={true}>
        <View style={styles.blurBackground} />
        <NotificationView
          sender={senderData}
          setViewNotification={setViewNotification}
        />
      </Modal>

      <Modal
        visible={showLocationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLocationModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.locationModalContainer}
        >
          <View style={styles.locationModalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowLocationModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>

            <View style={styles.locationHeader}>
              <Ionicons name="location" size={30} color="#e75f62" />
              <Text style={styles.locationTitle}>Where do you want to go?</Text>
            </View>

            <Text style={styles.locationDescription}>
              Enter your destination to find drivers who can help you get there
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="search"
                size={20}
                color="#999"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.locationInput}
                placeholder="Enter your destination"
                value={targetLocation}
                onChangeText={setTargetLocation}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleLocationSubmit}
            >
              <Text style={styles.confirmButtonText}>Find Drivers</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContainer: {
    padding: 15,
  },
  notificationBoxContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  notificationItem: {
    flex: 1,
    marginLeft: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontWeight: "700",
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  time: {
    color: "#888",
    fontSize: 12,
    fontWeight: "500",
  },
  messageText: {
    color: "#666",
    fontSize: 14,
    lineHeight: 20,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 5,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  locationText: {
    color: "#e75f62",
    fontSize: 13,
    marginLeft: 4,
    fontWeight: "500",
  },
  iconContainer: {
    backgroundColor: "#f8f8f8",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 15,
  },
  blurBackground: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 10,
  },
  locationModalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  locationModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 25,
    paddingTop: 30,
    paddingBottom: Platform.OS === "ios" ? 40 : 25,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  locationTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 10,
    color: "#333",
  },
  locationDescription: {
    fontSize: 15,
    color: "#666",
    marginBottom: 25,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  inputIcon: {
    marginRight: 10,
  },
  locationInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: "#e75f62",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
});

export default Notifications;
