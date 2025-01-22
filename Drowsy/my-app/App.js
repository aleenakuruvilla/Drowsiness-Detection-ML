import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import SignUpScreen from './src/Screens/LoginAndRegister/SignUpScreen';
import SignInScreen from './src/Screens/LoginAndRegister/SignInScreen.js';
import { Home } from './src/Screens/Home';
import UserDetails from './src/Screens/Admin/AdminUsers.js';
import AdminHome from './src/Screens/Admin/adminHome.js';
import ProfileScreen from './src/Screens/Profile.js';
import Notifications from './src/Screens/Notifications.js';
import Toast from 'react-native-toast-message';
import { NavigationContainer, useNavigation, DrawerActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import 'react-native-gesture-handler';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/Entypo';
import DrawerContent from './DrawerContent.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from './src/context/UserContext.js';
import NotificationService from './src/services/NotificationService.js';
import DriverList from './src/Screens/DriverList.js';
import LocationView from './src/Screens/LocationView.js';

const StackNav = () => {
  const Stack = createNativeStackNavigator();
  const navigation = useNavigation()
  
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: {
        backgroundColor: 'purple',
      },
      headerTintColor: 'white',
      headerTitleAlign: 'center',
    }}>
      <Stack.Screen name="Home" component={Home} options={{
        headerLeft: () => {
          return (
            <Icon
              name="menu"
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              size={30}
              color="white" />
          )
        }
      }} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="DriverList" component={DriverList} />
      <Stack.Screen name="LocationView" component={LocationView} />
    </Stack.Navigator>
  )
}

const DrawerNav = () => {
  const Drawer = createDrawerNavigator();

  return (
    <Drawer.Navigator drawerContent={props => <DrawerContent{...props} />} screenOptions={{
      headerShown: false
    }}>
      <Drawer.Screen name='Home' component={StackNav} />
    </Drawer.Navigator>
  )
}

const AdminStack=()=>{
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator>
      <Stack.Screen name="AdminHome" options={{ headerShown: false }} component={AdminHome} />
      <Stack.Screen name="SignIn" options={{ headerShown: false }} component={LoginNav} />
      <Stack.Screen  name="UserDetails"  component={UserDetails} />
    </Stack.Navigator>
  )
}

const LoginNav = () => {
const Stack = createNativeStackNavigator();
return (
  <Stack.Navigator
  screenOptions={{
    headerStyle: {
      backgroundColor: 'purple',
    },
    headerTintColor: 'white',
    headerTitleAlign: 'center',
  }}>
  <Stack.Screen name="SignIn" options={{ title: 'CarApp' }} component={SignInScreen} />
  <Stack.Screen name="SignUp" options={{ title: 'CarApp' }} component={SignUpScreen} />
  <Stack.Screen name="Home" options={{ headerShown: false }} component={DrawerNav} />
  <Stack.Screen name="AdminHome" options={{ headerShown: false }} component={AdminStack} />
 </Stack.Navigator>
)

}

const App = () => {
const { user, setUser } = useUser();
const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    NotificationService();
  }, []);

  async function getData() {
    const userData = await AsyncStorage.getItem('user');
    const adminStatus = await AsyncStorage.getItem('userType');
    setUser(JSON.parse(userData));
    setIsAdmin(adminStatus);
  }

  useEffect(() => {
    getData()
  }, [])

  return (
    <NavigationContainer>
        {user && isAdmin=="true" ?(
           <AdminStack/>
         ) :user? (
         <DrawerNav/>)
          :(
             <LoginNav/>
            )}
        <Toast/>
    </NavigationContainer>
  );
}

export default App;
