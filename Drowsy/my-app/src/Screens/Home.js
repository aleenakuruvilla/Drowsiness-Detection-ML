import { ScrollView, StyleSheet, Text, View, Image, BackHandler, Alert, RefreshControl } from 'react-native';
import { Avatar } from 'react-native-paper';
import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Check from 'react-native-vector-icons/Feather';
import Back from 'react-native-vector-icons/Ionicons';
import Gender from 'react-native-vector-icons/Foundation';
import Mobile from 'react-native-vector-icons/Entypo';
import Error from 'react-native-vector-icons/MaterialIcons';
import Email from 'react-native-vector-icons/MaterialCommunityIcons';
import Profession from 'react-native-vector-icons/AntDesign';
import {DrawerActions, useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import Toast from 'react-native-toast-message'; 
import { useUser } from '../context/UserContext';

const Home = (props) => {
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);

const handleBackPress = ()=>{
  Alert.alert(
    'Exit App','Are you sure you want to exit?',[
      {
       text:'Cancel',
       onPress:()=>null,
       style:'cancel'
    },
    {
      text:'Exit',
      onPress:()=>BackHandler.exitApp(),
    },
  ]);
  return true;
}

useFocusEffect(
  React.useCallback(()=>{
    BackHandler.addEventListener("hardwareBackPress",handleBackPress)
    return ()=>{
      BackHandler.removeEventListener("hardwareBackPress",handleBackPress)
    }

  })
)

return (
  <ScrollView
  showsVerticalScrollIndicator={false}
>
    <View>
      <View style={{position: 'relative'}}>

        <Image
            width={100}
            height={60}
            resizeMode="contain"
            style={{
              marginTop: -150,
            }}
            source={require('../../assets/wave.png')}
          />
          </View>
          <View style={{alignItems: 'center'}}>
          <Avatar.Image
            size={180}
            style={styles.avatar}
            source={{
              uri: `${process.env.EXPO_PUBLIC_BACKEND_URL}/${user.profileImage}` }}
            />
            </View>
            <View style={{marginTop: -50}}>
          <Text style={styles.nameText}>{user.name}</Text>
        </View>

        <View style={{marginTop: 20, marginHorizontal: 25}}>
          <View style={styles.infoMain}>
            <View style={styles.infoCont}>
              <View style={[styles.infoIconCont, {backgroundColor: '#ff9500'}]}>
                <Email name="email" size={24} style={{color: 'white'}} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoSmall_Text}>Email</Text>
                <Text style={styles.infoLarge_Text} numberOfLines={1}>
                  {user.email}
                  </Text>
              </View>
            </View>
          </View>
          <View style={styles.infoMain}>
            <View style={styles.infoCont}>
              <View style={[styles.infoIconCont, {backgroundColor: '#0d7313'}]}>
                <Gender
                  name="torsos-male-female"
                  size={28}
                  color="blue"
                  style={{color: 'white'}}
                />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoSmall_Text}>Gender</Text>
                <Text style={styles.infoLarge_Text}>
                  {user.gender == '' ||
                  user.gender == undefined ||
                  user.gender == null
                    ? ''
                    : user.gender}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoMain}>
            <View style={styles.infoCont}>
              <View style={[styles.infoIconCont, {backgroundColor: '#774BBC'}]}>
                <Profession name="profile" size={24} style={{color: 'white'}} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoSmall_Text}>Profession</Text>
                <Text style={styles.infoLarge_Text}>
                  
                  {user.profession == '' ||
                  user.profession == undefined ||
                  user.profession == null
                    ? 'Driver'
                    : user.profession}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoMain}>
            <View style={styles.infoCont}>
              <View style={[styles.infoIconCont, {backgroundColor: '#f2276e'}]}>
                <Mobile name="mobile" size={24} style={{color: 'white'}} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoSmall_Text}>Mobile</Text>
                <Text style={styles.infoLarge_Text}>{user.mobile}</Text>
              </View>
            </View>
          </View>
        </View>
        
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  editIcon: {
    zIndex: 1,
    color: 'white',
    position: 'absolute',
    right: 2,
    margin: 15,
  },
  backIcon: {
    zIndex: 1,
    color: 'white',
    position: 'absolute',
    left: 2,
    margin: 15,
  },
  avatar: {
    borderRadius: 100,
    marginTop: -250,
    // marginLeft: 105,
    backgroundColor: 'white',
    height: 200,
    width: 200,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 420475
  nameText: {
    color: 'black',
    fontSize: 28,

    fontStyle: 'normal',
    fontFamily: 'Open Sans',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bookCountMain: {
    borderColor: '#b0b0b0',
    borderWidth: 1,
    marginTop: 18,
    marginHorizontal: 20,

    borderRadius: 20,
    flexDirection: 'row',
    width: '88%',
  },
  bookCount: {
    width: '50%',
    borderColor: '#b0b0b0',
    borderRightWidth: 1,
    flexDirection: 'column',
    paddingHorizontal: 10,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookCountNum: {
    color: '#5D01AA',
    fontSize: 34,
    fontWeight: '800',
  },
  bookCountText: {color: '#b3b3b3', fontSize: 14, fontWeight: '500'},
  infoMain: {
    marginTop: 10,
  },
  infoCont: {
    width: '100%',
    flexDirection: 'row',
  },
  infoIconCont: {
    justifyContent: 'center',
    height: 40,
    width: 40,
    borderRadius: 20,

    alignItems: 'center',
    elevation: -5,
    borderColor: 'black',
    backgroundColor: 'black',
  },

  infoText: {
    width: '80%',
    flexDirection: 'column',
    marginLeft: 25,
    borderBottomWidth: 1,
    paddingBottom: 10,
    borderColor: '#e6e6e6',
  },
  infoSmall_Text: {
    fontSize: 13,
    color: '#b3b3b3',
    fontWeight: '500',
  },
  infoLarge_Text: {
    color: 'black',
    fontSize: 18,
    fontWeight: '600',
  },
  booksUploadedMain: {
    paddingHorizontal: 10,
    paddingBottom: 30,
    marginTop: 20,
  },
  flatlistDiv: {
    borderRadius: 15,
    paddingHorizontal: 10,
  },
  booksUploadedText: {
    fontSize: 26,
    color: 'black',
    fontWeight: '700',
    paddingLeft: 20,
    paddingBottom: 8,
  },
  booksUploadedCard: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 9,
    marginBottom: 9,

    backgroundColor: '#f2f2f2',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 15,
    elevation: 3,
  },
  booksUploadedImgDiv: {
    width: '28%',
  },
  booksUploadedImg: {
    width: '100%',
    height: 120,
    borderRadius: 15,
  },
  cardMidDiv: {
    paddingHorizontal: 10,
    width: '55%',
    position: 'relative',
  },
  approvedText: {
    fontSize: 12,
    color: '#0d7313',
    fontWeight: '600',
    marginLeft: 5,
  },
  cardBookNameText: {
    fontSize: 24,
    color: 'black',
    fontWeight: '700',
    marginTop: 2,
  },
  cardBookAuthor: {
    fontSize: 14,
    color: 'black',
    fontWeight: '600',
    marginTop: 1,
  },
  cardRating: {
    position: 'absolute',
    bottom: 0,
    paddingHorizontal: 10,
    flexDirection: 'row',
  },
  cardRatingCount: {
    fontSize: 14,
    marginTop: -2,
    paddingLeft: 4,
    color: '#303030',
  },
  cardEditDiv: {
    width: '17%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEditBtn: {
    height: 44,
    width: 44,
    backgroundColor: '#774BBC',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 10,
    justifyContent: 'center',

    flexDirection: 'row',
  },
  loadMoreBtn: {
    padding: 10,
    backgroundColor: '#f5a002',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    paddingHorizontal: 20,
  },
  btnText: {
    color: 'white',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  refreshControl: {
    marginTop: 90, // Adjust this value based on how much you want to pull down
  },
});

export { Home };
