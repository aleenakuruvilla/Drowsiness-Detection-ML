import { PermissionsAndroid } from "react-native";
import messaging from "@react-native-firebase/messaging";
import database from "@react-native-firebase/database";

const NotificationService = async () => {
  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

  messaging().onMessage(async (remoteMessage) => {
    const { notification, data } = remoteMessage;
    saveNotificationToDatabase(notification, data);
  });

  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    const { notification, data } = remoteMessage;
    saveNotificationToDatabase(notification, data);
  });
};

const saveNotificationToDatabase = async (notification, data) => {
  console.log(notification, data);
  try {
    await database().ref(`notifications/${data.userId}`).push().set({
      title: notification.title,
      message: notification.body,
      userId: data.userId,
      senderId: data.senderId,
      profileImage: data.profileImage,
      confirmation: data.confirmation,
      targetLocation: data.targetLocation,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Failed to save notification to database ", error);
  }
};

export default NotificationService;
