import React, { useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  BackHandler,
  Alert,
  ScrollView,
} from "react-native";
import { Avatar } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { useUser } from "../context/UserContext";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Foundation } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

const InfoItem = ({ icon, label, value, color }) => (
  <View style={styles.infoItem}>
    <View style={[styles.iconContainer, { backgroundColor: color }]}>
      {icon}
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value || "Not provided"}
      </Text>
    </View>
  </View>
);

const Home = () => {
  const { user } = useUser();

  const handleBackPress = useCallback(() => {
    Alert.alert(
      "Exit App",
      "Are you sure you want to exit?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Exit",
          onPress: () => BackHandler.exitApp(),
        },
      ],
      { cancelable: false }
    );
    return true;
  }, []);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress
      );
      return () => subscription.remove();
    }, [handleBackPress])
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#774BBC", "#5D01AA"]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Image
              source={require("../../assets/wave.png")}
              style={styles.waveImage}
              resizeMode="cover"
            />
          </View>
        </LinearGradient>

        <View style={styles.profileSection}>
          <Avatar.Image
            size={120}
            source={{ uri: `${process.env.EXPO_PUBLIC_BACKEND_URL}/${user.profileImage}` }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{user?.name || "User"}</Text>
        </View>

        <View style={styles.infoSection}>
          <InfoItem
            icon={
              <MaterialCommunityIcons
                name="email"
                size={22}
                style={{ color: "white" }}
              />
            }
            label="Email"
            value={user?.email}
            color="#FF9500"
          />

          <InfoItem
            icon={
              <Foundation
                name="torsos-male-female"
                size={22}
                style={{ color: "white" }}
              />
            }
            label="Gender"
            value={user?.gender}
            color="#0D7313"
          />

          <InfoItem
            icon={
              <AntDesign name="profile" size={22} style={{ color: "white" }} />
            }
            label="Profession"
            value={user?.profession || "Driver"}
            color="#774BBC"
          />

          <InfoItem
            icon={
              <Entypo name="mobile" size={22} style={{ color: "white" }} />
            }
            label="Mobile"
            value={user?.mobile}
            color="#F2276E"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerGradient: {
    height: 180,
    width: "100%",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flex: 1,
    overflow: "hidden",
  },
  waveImage: {
    width: "100%",
    height: "100%",
    opacity: 0.3,
  },
  profileSection: {
    alignItems: "center",
    marginTop: -60,
    paddingBottom: 20,
  },
  avatar: {
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "white",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  userName: {
    fontSize: 24,
    color: "#333",
    fontWeight: "700",
    marginTop: 16,
    letterSpacing: 0.5,
  },
  infoSection: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 30,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#777",
    marginBottom: 2,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
});

export { Home };