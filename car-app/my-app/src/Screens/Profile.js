import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShowToast } from '../components/Toast.js';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

function ProfileScreen(props) {
  const [userData, setUserData] = useState({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('*******');
  const [mobile, setMobile] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState({});
  const navigation = useNavigation();

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (userData) {
      setName(userData.name || '');
      setEmail(userData.email || '');
      setPassword(''); 
      setMobile(userData.mobile || '');
    }
  }, [userData]);

  const getData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND}/userdata`, { token });
      setUserData(res.data.data);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  const validateFields = () => {
    let tempErrors = {};
    let isValid = true;

    if (!/^[A-Za-z]/.test(name.trim())) {
      tempErrors['name'] = "Name must start with an alphabet";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
      tempErrors['email'] = "Email must be a valid @gmail.com address";
      isValid = false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (password.length > 0 && !passwordRegex.test(password)) {
      tempErrors['password'] = "Password must be at least 6 characters long, contain 1 uppercase letter, 1 lowercase letter, and 1 number";
      isValid = false;
    }

    const mobileRegex = /^[789]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      tempErrors['mobile'] = "Invalid mobile number. Must be 10 digits and start with 7, 8, or 9";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleUpdate = () => {
    if (validateFields()) {
      axios.post(`${process.env.EXPO_PUBLIC_BACKEND}/updateuser`, { name, email, password, mobile })
        .then((res) => {
          ShowToast('success', "Profile updated successfully!!");
          navigation.navigate('Home');
        })
        .catch((err) => {
          ShowToast('error', "Couldn't update the Profile");
        });
    } else {
      ShowToast('error', "Please correct the errors before submitting");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
      style={profileStyles.scrollViewContainer}
    >
      <View style={profileStyles.profileContainer}>
        <View style={profileStyles.centered}>
          <Image
            source={{ uri: "https://img.freepik.com/premium-vector/system-software-update-illustration-design-concept-illustration-websites-landing-pages-mobile-applications-posters-banners_108061-821.jpg?semt=ais_hybrid" }}
            style={profileStyles.profileImage}
          />
          {/* <Text style={profileStyles.profileName}>{name || "User Name"}</Text> */}
        </View>

        {/* Name Input */}
        <View style={profileStyles.inputGroup}>
          <Ionicons name="person-circle-outline" size={24} color="purple" style={profileStyles.icon} />
          <TextInput
            style={profileStyles.inputBox}
            placeholder="Enter your name"
            value={name}
            onChangeText={(text) => setName(text)}
          />
        </View>
        {errors.name ? <Text style={profileStyles.errorText}>{errors.name}</Text> : null}

        <View style={profileStyles.inputGroup}>
  <MaterialIcons name="email" size={21} color="purple" style={profileStyles.icon} />
  <TextInput
    style={profileStyles.inputBox}
    placeholder="Enter your email"
    value={email}
    editable={false}  // Make the email field non-editable
  />
</View>
{errors.email ? <Text style={profileStyles.errorText}>{errors.email}</Text> : null}

       {/* Password Input (Non-Editable) */}
<View style={profileStyles.inputGroup}>
  <FontAwesome5 name="lock" size={20} color="purple" style={profileStyles.icon} />
  <TextInput
    style={profileStyles.inputBox}
    placeholder="******"
    secureTextEntry={true}
    value={password}
    editable={false}  // Make the password field non-editable
  />
</View>
{errors.password ? <Text style={profileStyles.errorText}>{errors.password}</Text> : null}

        {/* Mobile Input */}
        <View style={profileStyles.inputGroup}>
          <Ionicons name="call" size={20} color="purple" style={profileStyles.icon} />
          <TextInput
            style={profileStyles.inputBox}
            placeholder="Enter your mobile number"
            value={mobile}
            onChangeText={(text) => setMobile(text)}
            keyboardType='numeric'
          />
        </View>
        {errors.mobile ? <Text style={profileStyles.errorText}>{errors.mobile}</Text> : null}

        {/* Update Button */}
        <TouchableOpacity style={profileStyles.updateButton} onPress={handleUpdate}>
          <Text style={profileStyles.buttonText}>Update Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const profileStyles = StyleSheet.create({
  scrollViewContainer: {
    backgroundColor: '#g9f9g0',
  },
  profileContainer: {
    flex: 1,
    marginBottom: 20,
    marginLeft:20,
    marginRight:20,
    justifyContent: 'center',
  },
  centered: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    height: 275,
    width: 350,
    // borderTopLeftRadius:20,
    // borderTopRightRadius:20,
    borderBottomLeftRadius:20,
    borderBottomRightRadius:20,
    marginBottom: -35,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },

  icon: {
    marginRight: 10,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    marginBottom: 15,
    borderWidth: 1, 
    borderColor: '#4B0082', // Border color
    padding: 18, 
  },
  inputBox: {
    flex: 1,
    backgroundColor: "#fff",

  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10, // Ensure space between error and next input
  },
  updateButton: {
    backgroundColor: 'purple',
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignSelf: 'center',
    shadowColor: "#6200EE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default ProfileScreen;
