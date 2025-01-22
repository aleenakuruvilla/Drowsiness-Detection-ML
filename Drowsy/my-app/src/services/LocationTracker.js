import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

const LOCATION_TRACKING = "location-tracking";

TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }

  if (data) {
    const { locations } = data;
    const location = locations[0];

    if (location) {
      console.log("Location tracked in background:", location);
      const token = await AsyncStorage.getItem('token');
      await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/update-location`, {
        token,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        locationLastUpdate: Date.now(),
      });
    }
  }
});

export async function startBackgroundTracking() {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  if (status !== "granted") {
    console.log("Background permission denied");
    return;
  }

  const isTracking = await TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING);
  if (!isTracking) {
    await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000, // Update every 5 sec
      distanceInterval: 10, // Update every 10m
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "Location Tracking",
        notificationBody: "Your location is being tracked in the background.",
      },
    });
  }
}
