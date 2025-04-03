import React, { useEffect, useState } from "react";
import { View, StatusBar } from "react-native";
import SignUpScreen from "./src/Screens/LoginAndRegister/SignUpScreen";
import SignInScreen from "./src/Screens/LoginAndRegister/SignInScreen.js";
import { Home } from "./src/Screens/Home";
import AdminHome from "./src/Screens/Admin/AdminHome.js";
import ProfileScreen from "./src/Screens/Profile.js";
import Notifications from "./src/Screens/Notifications.js";
import Toast from "react-native-toast-message";
import {
  NavigationContainer,
  useNavigation,
  DrawerActions,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import "react-native-gesture-handler";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Icon from "react-native-vector-icons/Entypo";
import DrawerContent from "./DrawerContent.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "./src/context/UserContext.js";
import NotificationService from "./src/services/NotificationService.js";
import DriverList from "./src/Screens/DriverList.js";
import LocationView from "./src/Screens/LocationView.js";
import { ActivityIndicator } from "react-native-paper";
import CompanyRegister from "./src/Screens/Admin/CompanyRegister.js";
import CompanyHome from "./src/Screens/Company/CompanyHome.js";
import WorkerDetails from "./src/Screens/Company/WorkerDetails.js";
import WorkerRegister from "./src/Screens/Company/WorkerRegister.js";

const AuthNavigator = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{
          headerShown: true,
          title: "Register",
          headerStyle: {
            backgroundColor: "purple",
          },
          headerTintColor: "white",
        }}
      />
    </Stack.Navigator>
  );
};

const StackNav = () => {
  const Stack = createNativeStackNavigator();
  const navigation = useNavigation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "purple",
        },
        headerTintColor: "white",
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen
        name="Home"
        component={Home}
        options={{
          headerLeft: () => {
            return (
              <Icon
                name="menu"
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                size={30}
                color="white"
              />
            );
          },
        }}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen
        name="DriverList"
        options={{ title: "Driver List" }}
        component={DriverList}
      />
      <Stack.Screen
        name="LocationView"
        options={{ title: "Location View" }}
        component={LocationView}
      />
    </Stack.Navigator>
  );
};

const DrawerNav = () => {
  const Drawer = createDrawerNavigator();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Drawer.Screen name="Home" component={StackNav} />
    </Drawer.Navigator>
  );
};

const AdminStack = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AdminHome"
        options={{ headerShown: false }}
        component={AdminHome}
      />
      <Stack.Screen
        name="CompanyRegister"
        options={{ title: "Company Register" }}
        component={CompanyRegister}
      />
    </Stack.Navigator>
  );
};

const CompanyStack = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CompanyHome"
        options={{ headerShown: false }}
        component={CompanyHome}
      />
      <Stack.Screen
        name="WorkerDetails"
        options={{ title: "Worker Details" }}
        component={WorkerDetails}
      />
      <Stack.Screen
        name="WorkerRegister"
        options={{ title: "Worker Register" }}
        component={WorkerRegister}
      />
    </Stack.Navigator>
  );
};

const InitialNavigator = ({ user }) => {
  if (!user) {
    return <AuthNavigator />;
  } else if (user.role === "admin") {
    return <AdminStack />;
  } else if (user.role === "company") {
    return <CompanyStack />;
  } else {
    return <DrawerNav />;
  }
};

const App = () => {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    NotificationService();
    getData();
  }, []);

  async function getData() {
    const userData = await AsyncStorage.getItem("user");

    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size={"large"} color="purple" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <InitialNavigator user={user} />
      <Toast />
    </NavigationContainer>
  );
};

export default App;
