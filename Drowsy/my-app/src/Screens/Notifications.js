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
} from "react-native";
import database from "@react-native-firebase/database";
import { useUser } from "../context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import NotificationView from "../components/NotificationView";
import { useNavigation } from "@react-navigation/native";
import { watchHeadingAsync } from "expo-location";

const Notifications = () => {
  const { user } = useUser();
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewNotification, setViewNotification] = useState(false);
  const [senderData, setSenderData] = useState();

  console.log(user._id);

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
        const filteredNotifications = Object.values(notificationsData)
          .sort((a, b) => b.timestamp - a.timestamp);
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
      navigation.navigate('DriverList', { item });
      return;
    }
    setViewNotification(true);
    setSenderData(item);
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleNotification(item)}>
      <View style={styles.notificationBoxContainer}>
        {item.profileImage && <Image
          source={{ uri: `${process.env.EXPO_PUBLIC_BACKEND_URL}/${item.profileImage}` }}
          style={styles.image}
        />}
        <View style={styles.notificationItem}>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.time}>{notificationTime(item.timestamp)}</Text>
          </View>
          <Text numberOfLines={3} ellipsizeMode="tail">
            {item.message}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={"large"} color={"purple"} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.windowMsgContainer}>
          <Text style={styles.windowMsgText}>
            You have no new notifications at the moment.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingRight: 10 }}
        />
      )}
      <Modal
        visible={viewNotification}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.blurBackground} />
        <NotificationView sender={senderData} setViewNotification={setViewNotification} />
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setViewNotification(false)}
        >
          <Ionicons name="close" size={30} color="#fff" />
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingRight: -10,
  },
  notificationBoxContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  notificationItem: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontWeight: "600",
  },
  time: {
    marginLeft: "auto",
    color: "grey",
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 50,
    alignSelf: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  windowMsgContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f3f5",
    borderRadius: 8,
    padding: 16,
  },
  windowMsgText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
    textAlign: "center",
  },
  blurBackground: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 10,
  },
});

export default Notifications;
