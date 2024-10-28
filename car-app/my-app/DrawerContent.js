import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Avatar, Title } from 'react-native-paper';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const DrawerList = [
    { icon: 'home-outline', label: 'Home', navigateTo: 'Home' },
    { icon: 'account-circle', label: 'Profile', navigateTo: 'Profile' },
    { icon: 'bell-outline', label: 'NotificationScreen', navigateTo: 'NotificationScreen' },
];

const DrawerLayout = ({ icon, label, navigateTo }) => {
    const navigation = useNavigation();
    return (
        <DrawerItem
            icon={({ color, size }) => <Icon name={icon} color={color} size={size} />}
            label={label}
            onPress={() => navigation.navigate(navigateTo)}
            style={styles.drawerItem}
        />
    );
};

const DrawerItems = () => {
    return DrawerList.map((el, i) => (
        <DrawerLayout
            key={i}
            icon={el.icon}
            label={el.label}
            navigateTo={el.navigateTo}
        />
    ));
};

function DrawerContent(props) {
    const navigation = useNavigation();
    const [userData, setUserData] = useState('');

    useEffect(() => {
        getData();
    }, []);

    const getData = async () => {
        const token = await AsyncStorage.getItem('token');
        axios.post(`${process.env.EXPO_PUBLIC_BACKEND}/userdata`, { token: token })
            .then((res) => {
                setUserData(res.data.data);
            });
    };

    const signOut = () => {
        AsyncStorage.setItem('isLoggedIn', '');
        AsyncStorage.setItem('token', '');
        navigation.navigate('SignIn');
        AsyncStorage.setItem('userType', '');
    };

    return (
        <View style={styles.container}>
            <DrawerContentScrollView {...props}>
                <View style={styles.drawerContent}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => getData()} // Refresh data on press
                    >
                        <View style={styles.userInfoSection}>
                            <View style={styles.userInfo}>
                                <Avatar.Image
                                    source={{
                                        uri: 'https://example.com/profile-pic.png', // Replace with a valid URL or base64 string
                                    }}
                                    size={50}
                                    style={styles.avatar}
                                />
                                <View style={styles.userInfoText}>
                                    <Title style={styles.title}>{userData.name}</Title>
                                    <Text style={styles.caption} numberOfLines={1}>
                                        {userData.email}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.drawerSection}>
                        <DrawerItems />
                    </View>
                </View>
            </DrawerContentScrollView>
            <View style={styles.bottomDrawerSection}>
                <DrawerItem
                    onPress={() => signOut()}
                    icon={({ color, size }) => (
                        <Icon name="exit-to-app" color={color} size={size} />
                    )}
                    label="Sign Out"
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
    drawerContent: {
        flex: 1,
    },
    userInfoSection: {
        paddingLeft: 20,
    },
    userInfo: {
        flexDirection: 'row',
        marginTop: 15,
    },
    avatar: {
        marginTop: 5,
    },
    userInfoText: {
        marginLeft: 10,
        flexDirection: 'column',
    },
    title: {
        fontSize: 16,
        marginTop: 3,
        fontWeight: 'bold',
    },
    caption: {
        fontSize: 13,
        lineHeight: 14,
        color: '#6e6e6e',
        width: '100%',
    },
    drawerSection: {
        marginTop: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#dedede',
    },
    bottomDrawerSection: {
        marginBottom: 15,
        borderTopColor: '#dedede',
        borderTopWidth: 1,
    },
    drawerItem: {
        marginVertical: 8,
    },
    signOutItem: {
        marginTop: 10,
    },
});

export default DrawerContent;
