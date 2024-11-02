import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import axios from 'axios';
import { ShowToast } from '../../components/Toast.js';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import Feather from 'react-native-vector-icons/Feather';
import Error from 'react-native-vector-icons/MaterialIcons';

const SignUpScreen = () => {
  const [name, setName] = useState('');
  const [nameVerify, setNameVerify] = useState(false);
  const [email, setEmail] = useState('');
  const [emailVerify, setEmailVerify] = useState(false);
  const [mobile, setMobile] = useState('');
  const [mobileVerify, setMobileVerify] = useState(false);
  const [aadhaarImage, setAadhaarImage] = useState(null); // State for Aadhaar image
  const navigation = useNavigation();

  function handleName(e) {
    const nameVar = e.nativeEvent.text;
    setName(nameVar);
    setNameVerify(/^[A-Za-z][A-Za-z\s]*$/.test(nameVar) && nameVar.length > 1);
  }

  function handleEmail(e) {
    const emailVar = e.nativeEvent.text;
    const emailPattern = /^[\w.%+-]+@gmail\.com$/;
    setEmail(emailVar);
    setEmailVerify(emailPattern.test(emailVar));
  }

  function handleMobile(e) {
    const mobileVar = e.nativeEvent.text;
    setMobile(mobileVar);
    setMobileVerify(/[6-9]{1}[0-9]{9}/.test(mobileVar));
  }

  // Open image picker for Aadhaar image selection
  const handleAadhaarPick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      ShowToast('error', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Allow cropping
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      // Check if the result has a valid URI
      if (result.assets && result.assets.length > 0) {
        setAadhaarImage(result.assets[0].uri); // Set the URI of the first asset
      }
    } else {
      ShowToast('info', 'Image selection canceled');
    }
  };

  const handleSignUp = () => {
    if (!name || !nameVerify) {
      ShowToast('error', 'Please enter a valid name.');
      return;
    }
    if (!email || !emailVerify) {
      ShowToast('error', 'Please enter a valid email address.');
      return;
    }
    if (!mobile || !mobileVerify) {
      ShowToast('error', 'Please enter a valid mobile number.');
      return;
    }
    if (!aadhaarImage) {
      ShowToast('error', 'Please upload your Aadhaar card image.'); // Check for Aadhaar image
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('mobile', mobile);
    formData.append('aadhaarImage', {
      uri: aadhaarImage,
      type: 'image/jpeg', // or 'image/png' based on your image type
      name: 'aadhaar.jpg', // Name for the file in the backend
    });

    ShowToast('info', 'Processing your sign-up...');
    axios.post(`${process.env.EXPO_PUBLIC_BACKEND}/register`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
      .then((res) => {
        if (res.data.status === "ok") {
          ShowToast('success', 'Registration successful. Password will be sent after validation.');
          navigation.navigate('SignIn');
        } else {
          ShowToast('error', res.data.data);
        }
      })
      .catch(() => ShowToast('error', "An error occurred"));
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <View style={styles.formWrapper}>
          <Image source={require('../../../assets/6.jpg')} style={styles.image} />
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.textInput, { paddingRight: 40 }]}
                value={name}
                onChange={handleName}
                placeholder="Enter your name"
              />
              {name.length > 0 && (nameVerify ? (
                <Feather name="check-circle" color="green" size={20} style={styles.icon} />
              ) : (
                <Error name="error" color="red" size={20} style={styles.icon} />
              ))}
            </View>
            {!nameVerify && name.length > 0 && (
              <Text style={styles.errorText}>Name should start with an alphabet and be more than 1 character.</Text>
            )}
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.textInput, { paddingRight: 40 }]}
                value={email}
                onChange={handleEmail}
                placeholder="Enter your email"
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {email.length > 0 && (emailVerify ? (
                <Feather name="check-circle" color="green" size={20} style={styles.icon} />
              ) : (
                <Error name="error" color="red" size={20} style={styles.icon} />
              ))}
            </View>
            {!emailVerify && email.length > 0 && (
              <Text style={styles.errorText}>Enter a valid email address.</Text>
            )}
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Mobile Number</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.textInput, { paddingRight: 40 }]}
                value={mobile}
                onChange={handleMobile}
                placeholder="Enter your mobile number"
                keyboardType="phone-pad"
                maxLength={10}
              />
              {mobile.length > 0 && (mobileVerify ? (
                <Feather name="check-circle" color="green" size={20} style={styles.icon} />
              ) : (
                <Error name="error" color="red" size={20} style={styles.icon} />
              ))}
            </View>
            {!mobileVerify && mobile.length > 0 && (
              <Text style={styles.errorText}>Phone number should start with 6-9 and be 10 digits long.</Text>
            )}
          </View>

          {aadhaarImage ? (
            <View style={styles.imagePreviewContainer}>
              <TouchableOpacity onPress={handleAadhaarPick} style={styles.changeImageButton}>
                <Text style={styles.changeImageText}>Change Image</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={handleAadhaarPick} style={styles.imagePicker}>
              <Text>Upload Document</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <View style={styles.signInRedirectContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text>Have an account? <Text>Sign In</Text></Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    marginTop: 10
  },
  formWrapper: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    marginBottom: 20,
  },
  aadhaarImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 8,
    marginBottom: 10,
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: '#f0f0f0'
  },
  changeImageButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  changeImageText: {
    color: '#fff',
  },
  signUpButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inputWrapper: {
    width: '100%',
    marginVertical: 10,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  inputContainer: {
    position: 'relative',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  icon: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  signInRedirectContainer: {
    marginTop: 20,
  },
});

export default SignUpScreen;
