import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, Text, View, Pressable, FlatList, ActivityIndicator, SafeAreaView, BackHandler, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Entypo, Ionicons } from "@expo/vector-icons";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

function AdminHome() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // State for pull-to-refresh
  const navigation = useNavigation();

  const handleBackPress = () => {
    Alert.alert(
      'Exit App', 'Are you sure you want to exit?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel'
        },
        {
          text: 'Exit',
          onPress: () => BackHandler.exitApp(),
        },
      ]);
    return true;
  }

  useFocusEffect(
    React.useCallback(() => {
      BackHandler.addEventListener("hardwareBackPress", handleBackPress)
      return () => {
        BackHandler.removeEventListener("hardwareBackPress", handleBackPress)
      }
    }, [])
  )

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND}/get-all-user`);
      // Filter out users with isadmin true
      const filteredUsers = res.data.data.filter(user => !user.isadmin);
      setUsers(filteredUsers);
      setLoading(false);
      setRefreshing(false); // Stop refreshing after data is fetched
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
      setRefreshing(false); // Stop refreshing on error
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSignOut = async () => {
    try {
      await AsyncStorage.setItem('isLoggedIn', '');
      await AsyncStorage.setItem('token', '');
      await AsyncStorage.setItem('userType', '');
      navigation.navigate('SignIn');
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  const handlePressUser = (user) => {
    navigation.navigate('UserDetails', { user });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#7F7FD5", "#E9E4F0"]} style={styles.gradient}>
        <View style={styles.container}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <Text style={styles.title}>Admin Dashboard</Text>
            <Pressable style={styles.signOutButton} onPress={handleSignOut}>
              <Feather name="log-out" size={18} color="white" />
            </Pressable>
          </View>

          {/* Section Title */}
          <Text style={styles.sectionTitle}>Registered Users</Text>

          {/* Display Users */}
          <View style={styles.usersContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <FlatList
                data={users}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => (
                  <Pressable style={styles.reportItem} onPress={() => handlePressUser(item)}>
                    <View
                      style={[
                        styles.reportIcon,
                        { backgroundColor: item.password ? '#28a745' : '#dc3545' } // Icon color based on password status
                      ]}
                    >
                      <Ionicons name="person-outline" size={24} color="white" />
                    </View>
                    <Text style={styles.reportText}>{item.name}</Text>
                    <View style={styles.chevron}>
                      <Entypo name="chevron-right" size={24} color="black" />
                    </View>
                  </Pressable>
                )}
                onRefresh={onRefresh}
                refreshing={refreshing}
              />
            )}
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, // Ensures SafeAreaView takes up the full screen
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 15,
    marginTop: 30,
    justifyContent: "flex-start",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1, // Bottom border
    borderBottomColor: "black", // Color for the bottom border
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: 'black',
    marginLeft: 10,
    flex: 1, // Allows centering
  },
  signOutButton: {
    backgroundColor: "#e74c3c",
    padding: 10,
    borderRadius: 15,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "bold",
    marginBottom: 25,
    marginTop: 30,
    color: "#333",
  },
  usersContainer: {
    flex: 1, // Ensures this container takes up the remaining space
    backgroundColor: "#f0f0f0", // Light grey for a clean, complementary look
    padding: 10,
    borderRadius: 10,
    elevation: 5,
  },
  reportItem: {
    backgroundColor: "#7f8c8d",
    padding: 8,
    marginBottom: 15,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  reportIcon: {
    padding: 10,
    borderRadius: 10,
  },
  reportText: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 10,
    color: "#ecf0f1",
    flex: 1,
  },
  chevron: {
    paddingLeft: 10,
  },
});

export default AdminHome;
