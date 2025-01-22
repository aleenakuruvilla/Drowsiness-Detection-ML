import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import ShowToast from "../components/Toast";
import { useUser } from "../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DriverList() {
  const { user } = useUser();
  const [drivers, setDrivers] = useState([]);
  const [location, setLocation] = useState({});
  const [requestedDrivers, setRequestedDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);

  const RADIUS_IN_KM = 10;

  useEffect(() => {
    getCurrentLocation();
    findDrivers();
  }, []);

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    console.log(currentLocation);
    setLocation(currentLocation.coords);
  }

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = (deg) => (deg * Math.PI) / 180;

    const R = 6371; // Earth's radius in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in km
  };

  const findDrivers = async () => {
    setLoading(true);
    const driverRes = await axios.get(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}/get-all-user`,
    );
    if (driverRes.data.status !== "Ok") {
      ShowToast("error", "Failed to get drivers");
      return;
    }

    const driversList = driverRes.data.data;
    for (const item of driversList) {
      item.requestLoading = false;
    }

    const filtered = driversList.filter((item) => {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        item.latitude,
        item.longitude,
      );
      return distance <= RADIUS_IN_KM;
    });
    console.log("driver test: ", filtered);
    setDrivers(driversList);
    setLoading(false);
  };

  const handleRequest = async (item) => {
    try {
      if (item.requestLoading) {
        return;
      }
      item.requestLoading = true;
      setRequestLoading(true);

      const token = await AsyncStorage.getItem("token");
      const recipientToken = item.fcmToken;

      if (!recipientToken) {
        throw new Error("Token not found");
      }

      const message = {
        targetToken: recipientToken,
        title: "Driving Request",
        body: `🚨 Urgent: ${user.name} seeks your support.`,
        senderId: `${user._id}`,
        userId: `${item._id}`,
        profileImage: `${user.profileImage}`,
        confirmation: "",
      };

      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/send-notification`,
        message,
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

      setRequestedDrivers((prevDrivers) => [...prevDrivers, item._id]);
      ShowToast("success", `Request sent successfully`);
    } catch (error) {
      ShowToast("error", "Request failed to send!");
      console.error("Error sending notification:", error);
    } finally {
      item.requestLoading = false;
      setRequestLoading(false);
    }
  };

  const renderDriverCard = ({ item, index }) => (
    <View style={styles.profileConatiner}>
      <Image source={{ uri: `${process.env.EXPO_PUBLIC_BACKEND_URL}/${item.profileImage}` }} style={styles.profileImage} />
      <View style={{ marginLeft: 15 }}>
        <Text style={styles.profileNameText}>{item.name}</Text>
        <Text style={styles.profileSubText}>{item.gender}</Text>
      </View>
      {requestedDrivers.includes(item._id) ? (
        <View style={styles.requestConatiner}>
          <Text>Requested</Text>
        </View>
      ) : item.requestLoading ? (
        <ActivityIndicator
          size={"small"}
          color={"#e75f62"}
          style={{ marginLeft: "auto", marginRight: 10 }}
        />
      ) : (
        <TouchableOpacity
          onPress={() => handleRequest(item)}
          style={{ marginLeft: "auto" }}
        >
          <View style={styles.requestConatiner}>
            <Text>Request</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={"large"} color={"#e75f62"} />
        </View>
      ) : drivers.length === 0 ? (
        <View style={styles.windowMsgContainer}>
          <Text style={styles.windowMsgText}>No drivers found.</Text>
        </View>
      ) : (
        <FlatList
          data={drivers}
          renderItem={renderDriverCard}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingRight: 10 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingRight: -10,
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
  profileConatiner: {
    flexDirection: "row",
    width: "100%",
    height: 70,
    alignItems: "center",
    marginVertical: 5,
    padding: 10,
    backgroundColor: "#fcfcfc",
    borderRadius: 10,
    elevation: 1,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  profileNameText: {
    fontSize: 20,
    fontWeight: "400",
  },
  profileSubText: {
    marginRight: 10,
    fontSize: 14,
    color: "grey",
  },
  requestConatiner: {
    marginLeft: "auto",
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
});
