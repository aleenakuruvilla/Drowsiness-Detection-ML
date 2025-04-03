import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import axios from 'axios';
import { ShowToast } from '../../components/Toast.js';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Feather, MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { SelectList } from 'react-native-dropdown-select-list';
import { LinearGradient } from 'expo-linear-gradient';

const SignUpScreen = () => {
  const [name, setName] = useState('');
  const [nameVerify, setNameVerify] = useState(false);
  const [email, setEmail] = useState('');
  const [emailVerify, setEmailVerify] = useState(false);
  const [mobile, setMobile] = useState('');
  const [mobileVerify, setMobileVerify] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordVerify, setPasswordVerify] = useState(false);
  const [aadhaarImage, setAadhaarImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [gender, setGender] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigation = useNavigation();

  const genderOptions = [
    { key: '1', value: "Male" },
    { key: '2', value: "Female" },
    { key: '3', value: "Other" }
  ];

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

  function handlePassword(e) {
    const passwordVar = e.nativeEvent.text;
    setPassword(passwordVar);
    setPasswordVerify(passwordVar.length >= 8);
  }

  const handleAadhaarPick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      ShowToast('error', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAadhaarImage(result.assets[0].uri);
    } else {
      ShowToast('info', 'Image selection canceled');
    }
  };
  
  const handleProfilePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      ShowToast('error', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    } else {
      ShowToast('info', 'Image selection canceled');
    }
  };

  const handleSignUp = async () => {
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
    if (!password || !passwordVerify) {
      ShowToast('error', 'Please enter a valid password.');
      return;
    }
    if (!gender) {
      ShowToast('error', 'Please select your gender.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('mobile', mobile);
    formData.append('password', password);
    formData.append('gender', gender);
    formData.append('role', "user");
    
    if (aadhaarImage) {
      formData.append('aadhaarImage', {
        uri: aadhaarImage,
        type: 'image/jpeg',
        name: 'aadhaar.jpg',
      });
    }
    
    if (profileImage) {
      formData.append('profileImage', {
        uri: profileImage,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });
    }

    ShowToast('info', 'Processing your sign-up...');
    try {
      const res = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      if (res.data.status === "Ok") {
        ShowToast('success', 'Registration successful. Password will be sent after validation.');
        navigation.navigate('SignIn');
      } else {
        ShowToast('error', res.data.data);
      }
    } catch (err) {
      ShowToast('error', "An error occurred");
      console.log(err);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const renderProgressBar = () => {
    let progress = 0;
    if (nameVerify) progress += 25;
    if (emailVerify) progress += 25;
    if (mobileVerify) progress += 25;
    if (passwordVerify) progress += 25;
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{progress}% Complete</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={"height"}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <LinearGradient
          colors={['#f9f9f9', '#f0f0f0']}
          style={styles.container}
        >
          <View style={styles.formWrapper}>
            <Text style={styles.title}>Create Account</Text>
            {renderProgressBar()}
            
            <View style={styles.inputSection}>
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Full Name</Text>
                <View style={[
                  styles.inputContainer,
                  name.length > 0 && { borderColor: nameVerify ? '#4CAF50' : '#FF5252' }
                ]}>
                  <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={name}
                    onChange={handleName}
                    placeholder="Enter your name"
                    placeholderTextColor="#999"
                  />
                  {name.length > 0 && (nameVerify ? (
                    <Feather name="check-circle" color="#4CAF50" size={20} style={styles.validationIcon} />
                  ) : (
                    <MaterialIcons name="error" color="#FF5252" size={20} style={styles.validationIcon} />
                  ))}
                </View>
                {!nameVerify && name.length > 0 && (
                  <Text style={styles.errorText}>Name should start with a letter and be more than 1 character</Text>
                )}
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Email Address</Text>
                <View style={[
                  styles.inputContainer,
                  email.length > 0 && { borderColor: emailVerify ? '#4CAF50' : '#FF5252' }
                ]}>
                  <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={email}
                    onChange={handleEmail}
                    placeholder="example@gmail.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholderTextColor="#999"
                  />
                  {email.length > 0 && (emailVerify ? (
                    <Feather name="check-circle" color="#4CAF50" size={20} style={styles.validationIcon} />
                  ) : (
                    <MaterialIcons name="error" color="#FF5252" size={20} style={styles.validationIcon} />
                  ))}
                </View>
                {!emailVerify && email.length > 0 && (
                  <Text style={styles.errorText}>Enter a valid Gmail address</Text>
                )}
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Mobile Number</Text>
                <View style={[
                  styles.inputContainer,
                  mobile.length > 0 && { borderColor: mobileVerify ? '#4CAF50' : '#FF5252' }
                ]}>
                  <Feather name="smartphone" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={mobile}
                    onChange={handleMobile}
                    placeholder="10-digit mobile number"
                    keyboardType="phone-pad"
                    maxLength={10}
                    placeholderTextColor="#999"
                  />
                  {mobile.length > 0 && (mobileVerify ? (
                    <Feather name="check-circle" color="#4CAF50" size={20} style={styles.validationIcon} />
                  ) : (
                    <MaterialIcons name="error" color="#FF5252" size={20} style={styles.validationIcon} />
                  ))}
                </View>
                {!mobileVerify && mobile.length > 0 && (
                  <Text style={styles.errorText}>Phone number should start with 6-9 and be 10 digits</Text>
                )}
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Password</Text>
                <View style={[
                  styles.inputContainer,
                  password.length > 0 && { borderColor: passwordVerify ? '#4CAF50' : '#FF5252' }
                ]}>
                  <Feather name="lock" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={password}
                    onChange={handlePassword}
                    placeholder="Minimum 8 characters"
                    secureTextEntry={!passwordVisible}
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity onPress={togglePasswordVisibility} style={styles.validationIcon}>
                    <Feather name={passwordVisible ? "eye" : "eye-off"} color="#666" size={20} />
                  </TouchableOpacity>
                </View>
                {!passwordVerify && password.length > 0 && (
                  <Text style={styles.errorText}>Password should be minimum 8 characters</Text>
                )}
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.genderContainer}>
                  <SelectList 
                    setSelected={(val) => setGender(val)} 
                    data={genderOptions} 
                    save="value"
                    boxStyles={styles.selectBox}
                    dropdownStyles={styles.dropdown}
                    inputStyles={styles.selectInput}
                    dropdownTextStyles={styles.dropdownText}
                    placeholder="Select gender"
                    search={false}
                  />
                </View>
              </View>
            </View>

            <View style={styles.imageUploadSection}>
              <View style={styles.uploadContainer}>
                {profileImage ? (
                  <View style={styles.profileImageContainer}>
                    <Image source={{ uri: profileImage }} style={styles.profileImage} />
                    <TouchableOpacity style={styles.changeImageOverlay} onPress={handleProfilePick}>
                      <Feather name="camera" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.uploadButton} onPress={handleProfilePick}>
                    <Feather name="user" size={24} color="#666" />
                    <Text style={styles.uploadText}>Profile Photo</Text>
                  </TouchableOpacity>
                )}
                
                {aadhaarImage ? (
                  <View style={styles.documentContainer}>
                    <Image source={{ uri: aadhaarImage }} style={styles.documentImage} />
                    <TouchableOpacity style={styles.changeImageOverlay} onPress={handleAadhaarPick}>
                      <Feather name="camera" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.uploadButton} onPress={handleAadhaarPick}>
                    <FontAwesome5 name="id-card" size={24} color="#666" />
                    <Text style={styles.uploadText}>ID Document</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <TouchableOpacity 
              style={styles.signUpButton} 
              onPress={handleSignUp}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4776E6', '#8E54E9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.signInRedirectContainer}>
              <Text style={styles.redirectText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                <Text style={styles.signInText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    minHeight: '100%',
  },
  formWrapper: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    overflow: 'hidden',
    paddingBottom: 25,
  },
  headerImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 25,
    marginBottom: 8,
    textAlign: 'center',
  },
  progressContainer: {
    width: '85%',
    alignSelf: 'center',
    marginBottom: 20,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4776E6',
    borderRadius: 10,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 5,
  },
  inputSection: {
    width: '85%',
    alignSelf: 'center',
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    backgroundColor: '#F9F9F9',
    overflow: 'hidden',
  },
  inputIcon: {
    padding: 12,
  },
  textInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  validationIcon: {
    padding: 12,
  },
  errorText: {
    color: '#FF5252',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 2,
  },
  genderContainer: {
    marginBottom: 5,
  },
  selectBox: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    backgroundColor: '#F9F9F9',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    backgroundColor: '#fff',
    marginTop: 5,
  },
  selectInput: {
    fontSize: 16,
    color: '#333',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  imageUploadSection: {
    width: '85%',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 25,
  },
  uploadContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  uploadButton: {
    width: '47%',
    height: 120,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  uploadText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  profileImageContainer: {
    width: '47%',
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  documentContainer: {
    width: '47%',
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  documentImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changeImageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
  },
  signUpButton: {
    width: '85%',
    alignSelf: 'center',
    marginVertical: 10,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#4776E6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  gradientButton: {
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  signInRedirectContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  redirectText: {
    fontSize: 14,
    color: '#666',
  },
  signInText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4776E6',
  },
});

export default SignUpScreen;