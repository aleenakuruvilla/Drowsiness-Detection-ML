import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { fetchDirectionFromORS } from "../services/MapDirectionService";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const LocationView = ({ route }) => {
  const { targetCoords } = route.params;
  const [currentLocation, setCurrentLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  const destination = {
    latitude: 10.782184,
    longitude: 76.3264291,
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
    })();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      getDirections();
    }
  }, [currentLocation]);

  const getDirections = async () => {
    try {
      const startPoint = `${currentLocation.longitude},${currentLocation.latitude}`;
      const endPoint = `${destination.longitude},${destination.latitude}`;

      console.log(startPoint, endPoint);

      const data = await fetchDirectionFromORS(startPoint, endPoint);
      if (data.features && data.features.length > 0) {
        const coordinates = data.features[0].geometry.coordinates.map(
          (coord) => ({
            latitude: coord[1],
            longitude: coord[0],
          })
        );

        setRouteCoordinates(coordinates);
      }
    } catch (error) {
      console.error("Error getting directions:", error);
    }
  };

  if (routeCoordinates.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={"large"} color={"purple"} />
        <Text style={{ marginTop: 10, fontSize: 18 }}>Getting location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          ...currentLocation,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
      >
        <Marker
          coordinate={currentLocation}
          title="My Location"
          description="You are here"
          pinColor="blue"
        />

        <Marker
          coordinate={destination}
          title="Destination"
          description="Vehicle Location"
          pinColor="red"
        />

        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={3}
            strokeColor="#0066FF"
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LocationView;
