import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ActivityIndicator, SafeAreaView, TouchableOpacity, Image } from "react-native";
import axios from 'axios';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import * as SMS from 'expo-sms';
import Modal from 'react-native-modal';

function UserDetails({ route }) {
  const { user } = route.params;
  const [userData, setUserData] = useState(null);
  const [number, setNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false); // State for modal visibility

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND}/get-user-details/${user._id}`);
        setUserData(res.data.data);
        setNumber(res.data.data.mobile);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user details:', error);
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [user._id]);

  const generateRandomNumber = () => {
    return Math.floor(100 + Math.random() * 900); // Generate a random 3-digit number
  };

  const sendSMS = async () => {
    const randomNumber = generateRandomNumber();
    const newPassword = `Car${randomNumber}`; // Generate new password
    const message = `Account verified, Your password is ${newPassword}`; // Message with new password
  
    try {
      // Send SMS
      await SMS.sendSMSAsync(number, message);
      // Update password on the server
      const updatePasswordResponse = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND}/update-password`, {
        userId: user._id,
        newPassword,
      });
  
      if (updatePasswordResponse.data.status === 'ok') {
        alert('Message sent successfully. Password updated.');
      } else {
        alert('Message sent but failed to update password.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    }
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible); // Toggle modal visibility
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#6200EE" />
      ) : (
        userData && (
          <View style={styles.card}>
            {/* User Details with Icons */}
            <View style={styles.detailRow}>
              <MaterialIcons name="person" size={21} color="#6200EE" style={styles.icon} />
              <Text style={styles.detailText}>{userData.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="email" size={21} color="#6200EE" style={styles.icon} />
              <Text style={styles.detailText}>{userData.email}</Text>
            </View>
            <View style={styles.detailRow}>
              <FontAwesome name="phone" size={21} color="#6200EE" style={styles.icon} />
              <Text style={styles.detailText}>{userData.mobile}</Text>
            </View>

            {/* Button to open the image modal */}
            {userData.image && (
              <TouchableOpacity style={styles.openImageButton} onPress={toggleModal}>
                <Text style={styles.openImageButtonText}>Document</Text>
              </TouchableOpacity>
            )}

            {/* Display 'Verified' and tick mark if password is not null */}
            {userData.password ? (
              <View style={styles.verifiedContainer}>
                <FontAwesome name="check-circle" size={28} color="green" style={styles.verifiedIcon} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.verifyButton} onPress={sendSMS}>
                <FontAwesome name="shield" size={20} color="#FFF" style={styles.verifyIcon} />
                <Text style={styles.verifyButtonText}>Verify Account</Text>
              </TouchableOpacity>
            )}

            {/* Modal for full-sized image */}
            <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
              <View style={styles.modalContent}>
                <Image
                  source={{ uri: `${process.env.EXPO_PUBLIC_BACKEND}/${userData.image}` }}
                  style={styles.fullImage}
                />
                <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </Modal>
          </View>
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  card: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'flex-start',
  },
  openImageButton: {
    backgroundColor: '#6200EE',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  openImageButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    width: '100%',
  },
  icon: {
    backgroundColor: '#6200EE',
    borderRadius: 12,
    padding: 10,
    marginRight: 15,
    textAlign: 'center',
    overflow: 'hidden',
    color: 'white',
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8FFE8', 
    padding: 10,
    marginTop: 20,
    borderRadius: 10,
    width: '100%',
    alignSelf: 'center',
    borderColor: 'green',
    borderWidth: 1,
  },
  verifiedIcon: {
    marginRight: 10,
  },
  verifiedText: {
    fontSize: 14,
    color: 'green',
    fontWeight: '700',
  },
  verifyButton: {
    marginTop: 20,
    backgroundColor: '#FF5328',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  verifyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  verifyIcon: {
    marginRight: 10,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  fullImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain', // Maintain aspect ratio
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#6200EE',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default UserDetails;
