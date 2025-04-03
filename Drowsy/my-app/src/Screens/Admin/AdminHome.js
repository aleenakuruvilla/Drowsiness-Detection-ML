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
import { Feather, Ionicons, MaterialIcons, AntDesign } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect, CommonActions } from "@react-navigation/native";
import { useUser } from "../../context/UserContext";

const CompanyCard = memo(({ company, onPress }) => {
  const statusColor = company.isActive ? "#4CAF50" : "#FF5252";
  const statusText = company.isActive ? "Active" : "Inactive";
  
  return (
    <Pressable
      style={styles.companyCard}
      onPress={() => onPress(company)}
      android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
    >
      <View style={styles.companyCardContent}>
        <View style={styles.companyIconContainer}>
          {company.logo ? (
            <Image
              source={{ uri: `${process.env.EXPO_PUBLIC_BACKEND_URL}/${company.logo}` }}
              style={styles.companyLogo}
            />
          ) : (
            <View style={[styles.companyIcon, { backgroundColor: '#FF8C00' }]}>
              <Text style={styles.companyInitial}>
                {company.name ? company.name.charAt(0).toUpperCase() : "C"}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.companyInfo}>
          <Text style={styles.companyName} numberOfLines={1}>
            {company.name}
          </Text>
          <Text style={styles.companyEmail} numberOfLines={1}>
            {company.email || "No email provided"}
          </Text>
          <View style={[styles.companyStatus, { backgroundColor: statusColor }]}>
            <Text style={styles.companyStatusText}>{statusText}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

const EmptyState = memo(() => (
  <View style={styles.emptyState}>
    <Ionicons name="business-outline" size={80} color="#CCCCCC" />
    <Text style={styles.emptyStateTitle}>No companies found</Text>
    <Text style={styles.emptyStateMessage}>
      Pull down to refresh or add new companies to the system
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

function AdminHome() {
  const { setUser, companies, setCompanies } = useUser();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCompanies, setActiveCompanies] = useState(0);
  const [inactiveCompanies, setInactiveCompanies] = useState(0);
  const navigation = useNavigation();

  const handleBackPress = useCallback(() => {
    Alert.alert(
      "Exit Application",
      "Are you sure you want to exit the app?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Exit",
          style: "destructive",
          onPress: () => BackHandler.exitApp()
        }
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

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/get-all-companies`
      );
      
      const active = res.data.data.filter(company => company.isActive).length;
      const inactive = res.data.data.filter(company => !company.isActive).length;
      
      setCompanies(res.data.data);
      setActiveCompanies(active);
      setInactiveCompanies(inactive);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Error fetching company data:", error);
      Alert.alert(
        "Error", 
        "Failed to load companies. Please check your connection and try again."
      );
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSignOut = async () => {
    try {
      Alert.alert(
        "Sign Out",
        "Are you sure you want to sign out?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Sign Out",
            onPress: async () => {
              await AsyncStorage.clear();
              setUser(null);
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error during sign out:", error);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  const handlePressCompany = useCallback((company) => {
    navigation.navigate("CompanyDetails", { company });
  }, [navigation]);

  const navigateToAddCompany = () => {
    navigation.navigate("CompanyRegister");
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCompanies();
  }, [fetchCompanies]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#FF8C00" />
      <LinearGradient
        colors={["#FF8C00", "#FF6347"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSubtitle}>Manage companies</Text>
          </View>
          
          <Pressable
            style={styles.signOutButton}
            onPress={handleSignOut}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}
          >
            <Feather name="log-out" size={22} color="white" />
          </Pressable>
        </View>
        
        <View style={styles.content}>
          <View style={styles.statsContainer}>
            <StatsCard
              count={companies.length}
              title="Total Companies"
              icon={<Ionicons name="business" size={24} color="white" />}
              color="#FF6347"
            />
            <StatsCard
              count={activeCompanies}
              title="Active"
              icon={<Feather name="check-circle" size={24} color="white" />}
              color="#4CAF50"
            />
            <StatsCard
              count={inactiveCompanies}
              title="Inactive"
              icon={<Feather name="x-circle" size={24} color="white" />}
              color="#FF5252"
            />
          </View>
          
          <View style={styles.companiesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Registered Companies</Text>
              <Pressable
                style={styles.addButton}
                onPress={navigateToAddCompany}
                android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
              >
                <Text style={styles.addButtonText}>Add New</Text>
                <AntDesign name="plus" size={16} color="#FF8C00" />
              </Pressable>
            </View>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF8C00" />
                <Text style={styles.loadingText}>Loading companies...</Text>
              </View>
            ) : (
              <FlatList
                data={companies}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => (
                  <CompanyCard 
                    company={item} 
                    onPress={handlePressCompany} 
                  />
                )}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={["#FF8C00"]}
                    tintColor="#FF8C00"
                    title="Pull to refresh"
                    titleColor="#FF8C00"
                  />
                }
                contentContainerStyle={companies.length === 0 ? { flex: 1 } : null}
                ListEmptyComponent={<EmptyState />}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
        
        <Pressable
          style={styles.fab}
          onPress={navigateToAddCompany}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.2)', radius: 28 }}
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
    backgroundColor: "#FF8C00",
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
  companiesSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 140, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8C00',
    marginRight: 4,
  },
  companyCard: {
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
  companyCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  companyIconContainer: {
    marginRight: 16,
  },
  companyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  companyLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  companyInitial: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  companyEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
    marginBottom: 6,
  },
  companyStatus: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
  },
  companyStatusText: {
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
    position: 'absolute',
    bottom: 25,
    right: 25,
    backgroundColor: '#FF8C00',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});

export default AdminHome;