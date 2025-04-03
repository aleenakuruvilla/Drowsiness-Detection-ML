import React, { useEffect, useState, useCallback, memo } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  BackHandler,
  Alert,
  StatusBar,
  RefreshControl,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect, CommonActions } from "@react-navigation/native";
import { useUser } from "../../context/UserContext";

const UserCard = memo(({ user, onPress }) => {
  const statusColor = user.password ? "#4CAF50" : "#FF5252";
  const statusText = user.password ? "Active" : "Pending";

  return (
    <Pressable
      style={styles.userCard}
      onPress={() => onPress(user)}
      android_ripple={{ color: "rgba(0, 0, 0, 0.1)" }}
    >
      <View style={styles.userCardContent}>
        <View style={styles.userIconContainer}>
          {user.profileImage ? (
            <Image
              source={{
                uri: `${process.env.EXPO_PUBLIC_BACKEND_URL}/${user.profileImage}`,
              }}
              style={styles.userAvatar}
            />
          ) : (
            <View style={[styles.userIcon, { backgroundColor: "#6C63FF" }]}>
              <Text style={styles.userInitial}>
                {user.name ? user.name.charAt(0).toUpperCase() : "?"}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {user.name}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {user.email || "No email provided"}
          </Text>
          <View style={[styles.userStatus, { backgroundColor: statusColor }]}>
            <Text style={styles.userStatusText}>{statusText}</Text>
          </View>
        </View>

        <MaterialIcons name="arrow-forward-ios" size={20} color="#A0A0A0" />
      </View>
    </Pressable>
  );
});

const EmptyState = memo(() => (
  <View style={styles.emptyState}>
    <Ionicons name="people-outline" size={80} color="#CCCCCC" />
    <Text style={styles.emptyStateTitle}>No workers found</Text>
    <Text style={styles.emptyStateMessage}>
      Pull down to refresh or add new workers to the system
    </Text>
  </View>
));

const StatsCard = memo(({ count, title, icon, color }) => (
  <View style={[styles.statsCard, { backgroundColor: color }]}>
    {icon}
    <Text style={styles.statsCount}>{count}</Text>
    <Text style={styles.statsTitle}>{title}</Text>
  </View>
));

function CompanyHome() {
  const { user, setUser, workers, setWorkers } = useUser();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeWorkers, setActiveWorkers] = useState(0);
  const [pendingWorkers, setPendingWorkers] = useState(0);
  const navigation = useNavigation();

  const navigateToAddWorker = () => {
    navigation.navigate("WorkerRegister");
  };

  const handleBackPress = useCallback(() => {
    Alert.alert(
      "Exit Application",
      "Are you sure you want to exit the app?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Exit",
          style: "destructive",
          onPress: () => BackHandler.exitApp(),
        },
      ],
      { cancelable: false }
    );
    return true;
  }, []);

  useFocusEffect(
    useCallback(() => {
      BackHandler.addEventListener("hardwareBackPress", handleBackPress);
      return () => {
        BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
      };
    }, [handleBackPress])
  );

  const fetchUsers = useCallback(async () => {
    try {
      console.log(user._id);
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/get-company-workers/${user._id}`
      );

      const filteredUsers = res.data.data.filter(
        (user) => user.role !== "admin" && user.role !== "company"
      );
      const active = filteredUsers.filter((user) => user.password).length;
      const pending = filteredUsers.filter((user) => !user.password).length;

      setWorkers(filteredUsers);
      setActiveWorkers(active);
      setPendingWorkers(pending);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert(
        "Error",
        "Failed to load users. Please check your connection and try again."
      );
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSignOut = async () => {
    try {
      Alert.alert("Sign Out", "Are you sure you want to sign out?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          onPress: async () => {
            await AsyncStorage.clear();
            setUser(null);
          },
        },
      ]);
    } catch (error) {
      console.error("Error during sign out:", error);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  const handlePressUser = useCallback(
    (user) => {
      navigation.navigate("WorkerDetails", { user });
    },
    [navigation]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, [fetchUsers]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6C63FF" />
      <LinearGradient
        colors={["#6C63FF", "#4A42F3"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{user.name}</Text>
            <Text style={styles.headerSubtitle}>Manage your workers</Text>
          </View>

          <Pressable
            style={styles.signOutButton}
            onPress={handleSignOut}
            android_ripple={{ color: "rgba(255, 255, 255, 0.2)" }}
          >
            <Feather name="log-out" size={22} color="white" />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.statsContainer}>
            <StatsCard
              count={workers.length}
              title="Total Users"
              icon={<Ionicons name="people" size={24} color="white" />}
              color="#4A42F3"
            />
            <StatsCard
              count={activeWorkers}
              title="Active"
              icon={<Feather name="check-circle" size={24} color="white" />}
              color="#4CAF50"
            />
            <StatsCard
              count={pendingWorkers}
              title="Pending"
              icon={<Feather name="clock" size={24} color="white" />}
              color="#FF5252"
            />
          </View>

          <View style={styles.usersSection}>
            <Text style={styles.sectionTitle}>Registered Workers</Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6C63FF" />
                <Text style={styles.loadingText}>Loading workers...</Text>
              </View>
            ) : (
              <FlatList
                data={workers}
                keyExtractor={(item) => item?._id?.toString()}
                renderItem={({ item }) => (
                  <UserCard user={item} onPress={handlePressUser} />
                )}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={["#6C63FF"]}
                    tintColor="#6C63FF"
                    title="Pull to refresh"
                    titleColor="#6C63FF"
                  />
                }
                contentContainerStyle={workers.length === 0 ? { flex: 1 } : null}
                ListEmptyComponent={<EmptyState />}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
        <Pressable
          style={styles.fab}
          onPress={navigateToAddWorker}
          android_ripple={{ color: "rgba(255, 255, 255, 0.2)", radius: 28 }}
        >
          <AntDesign name="plus" size={24} color="white" />
        </Pressable>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#6C63FF",
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  signOutButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 12,
    borderRadius: 12,
  },
  content: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statsCard: {
    flex: 1,
    marginHorizontal: 5,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statsCount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginTop: 8,
  },
  statsTitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 2,
  },
  usersSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  userCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  userCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  userIconContainer: {
    marginRight: 16,
  },
  userIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInitial: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
    marginBottom: 6,
  },
  userStatus: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
  },
  userStatusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
  fab: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: "#6C63FF",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});

export default CompanyHome;
