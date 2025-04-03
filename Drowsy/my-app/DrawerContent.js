import React, { useCallback, memo } from "react";
import { View, StyleSheet, Text } from "react-native";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Avatar, Title, useTheme } from "react-native-paper";
import { useNavigation, CommonActions } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "./src/context/UserContext";

const DRAWER_ITEMS = [
  { icon: "home-outline", label: "Home", navigateTo: "Home" },
  { icon: "account-circle", label: "Profile", navigateTo: "Profile" },
  { icon: "bell-outline", label: "Notifications", navigateTo: "Notifications" },
];

const DrawerItemComponent = memo(({ icon, label, navigateTo }) => {
  const navigation = useNavigation();
  const theme = useTheme();

  const handlePress = useCallback(() => {
    navigation.navigate(navigateTo);
  }, [navigation, navigateTo]);

  return (
    <DrawerItem
      icon={({ size }) => (
        <Icon name={icon} color={theme.colors.primary} size={size} />
      )}
      label={({ focused }) => (
        <Text
          style={[
            styles.drawerItemLabel,
            { color: focused ? theme.colors.primary : theme.colors.text },
          ]}
        >
          {label}
        </Text>
      )}
      onPress={handlePress}
      style={styles.drawerItem}
      activeBackgroundColor={theme.colors.primaryLight}
    />
  );
});

const DrawerItemsList = memo(() => {
  return DRAWER_ITEMS.map((item, index) => (
    <DrawerItemComponent
      key={`drawer-item-${index}`}
      icon={item.icon}
      label={item.label}
      navigateTo={item.navigateTo}
    />
  ));
});

const UserInfo = memo(({ user }) => {
  const imageUri = user?.profileImage
    ? `${process.env.EXPO_PUBLIC_BACKEND_URL}/${user.profileImage}`
    : "https://via.placeholder.com/50";

  return (
    <View style={styles.userInfo}>
      <Avatar.Image
        source={{ uri: imageUri }}
        size={50}
        style={styles.avatar}
      />
      <View style={styles.userInfoText}>
        <Title style={styles.title}>{user?.name || "Guest User"}</Title>
        <Text style={styles.caption} numberOfLines={1}>
          {user?.email || "Sign in to access all features"}
        </Text>
      </View>
    </View>
  );
});

function DrawerContent(props) {
  const navigation = useNavigation();
  const { user, setUser } = useUser();
  const theme = useTheme();

  const handleSignOut = useCallback(async () => {
    try {
      await AsyncStorage.clear();
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }, [navigation, setUser]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.drawerContent}>
          <View style={styles.userInfoSection}>
            <UserInfo user={user} />
          </View>

          <View style={styles.drawerSection}>
            <DrawerItemsList />
          </View>

          {/* Additional section for app info */}
          <View style={styles.appInfoSection}>
            <Text style={styles.appVersion}>App Version: 1.0.0</Text>
          </View>
        </View>
      </DrawerContentScrollView>

      <View style={styles.bottomDrawerSection}>
        <DrawerItem
          icon={({ size }) => (
            <Icon name="exit-to-app" color={theme.colors.primary} size={size} />
          )}
          label={({ focused }) => (
            <Text
              style={[styles.drawerItemLabel, { color: theme.colors.text }]}
            >
              Sign Out
            </Text>
          )}
          onPress={handleSignOut}
          style={styles.signOutItem}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
  },
  userInfoText: {
    marginLeft: 15,
    flexDirection: "column",
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  caption: {
    fontSize: 13,
    lineHeight: 16,
    color: "#6e6e6e",
    marginTop: 2,
  },
  drawerSection: {
    marginTop: 5,
  },
  drawerItem: {
    marginVertical: 4,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  drawerItemLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: "#f0f0f0",
    borderTopWidth: 1,
    paddingTop: 10,
  },
  signOutItem: {
    marginTop: 5,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  appInfoSection: {
    marginTop: 20,
    paddingLeft: 20,
    paddingBottom: 10,
  },
  appVersion: {
    fontSize: 12,
    color: "#9e9e9e",
  },
});

export default memo(DrawerContent);
