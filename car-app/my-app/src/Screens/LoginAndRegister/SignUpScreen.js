import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import axios from 'axios';
import { ShowToast } from '../../components/Toast.js';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import Error from 'react-native-vector-icons/MaterialIcons';

const SignUpScreen = () => {
  const [name, setName] = useState('');
  const [nameVerify, setNameVerify] = useState(false);
  const [email, setEmail] = useState('');
  const [emailVerify, setEmailVerify] = useState(false);
  const [mobile, setMobile] = useState('');
  const [mobileVerify, setMobileVerify] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

    ShowToast('info', 'Processing your sign-up...');
    axios.post(`${process.env.EXPO_PUBLIC_BACKEND}/register`, { name, email, mobile })
      .then((res) => {
        if (res.data.status === "ok") {
          ShowToast('success', 'Registration successful. Password will be sent after validation.');
          navigation.navigate('SignIn');
        } else {
          ShowToast('error', res.data.data);
        }
      })
      .catch((err) => {
        ShowToast('error', "An error occurred");
      });
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
  label: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
    fontWeight: 'bold',
    width: '100%',
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 16,
  },
  inputContainer: {
    position: 'relative',
  },
  textInput: {
    height: 40,
    borderColor: 'grey',
    borderWidth: 1,
    paddingHorizontal: 8,
    borderRadius: 10,
    width: '100%',
    color: 'black',
  },
  icon: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  errorText: {
    marginLeft: 0,
    color: 'red',
  },
  signUpButton: {
    width: '70%',
    backgroundColor: '#420475',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 50,
    marginTop: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  signInRedirectContainer: {
    marginTop: 20,
  },
});

export default SignUpScreen;
