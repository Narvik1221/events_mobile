import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { WebView } from "react-native-webview";
import Slider from "@react-native-community/slider";
import * as Location from "expo-location";
import { useGetEventsQuery, useGetCategoriesQuery } from "../api/api";
import EventModal from "../components/EventModal";
import { getAvatarUri } from "../lib/getAvatarUri";

const API_KEY = "b06fdb53-2726-4de6-8245-aa3ab977de84";
const MOSCOW_COORDS = [55.751574, 37.573856];

const YandexMapScreen: React.FC<{ navigation?: any }> = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  // Состояния для поиска по радиусу
  const [radius, setRadius] = useState(30); // по умолчанию 30 км
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const { data: categories } = useGetCategoriesQuery();
  const {
    data: events,
    error,
    isLoading,
  } = useGetEventsQuery({
    categoryId: selectedCategory || undefined,
    search: search.trim() ? search.trim() : undefined,
    radius: radius,
    userLat: userLocation?.lat,
    userLng: userLocation?.lng,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const openModal = (eventData: any) => {
    setSelectedEvent(eventData);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedEvent(null);
  };

  // Функция для получения координат с использованием expo-location
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Разрешение на доступ к геолокации не получено");
        return;
      }

      // Всегда получаем актуальную позицию
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
      } as any);
      console.log("Получены координаты:", location.coords);
      if (location && location.coords) {
        const { latitude, longitude } = location.coords;
        // Если координаты равны 0, считаем их некорректными
        if (latitude === 0 && longitude === 0) {
          console.warn("Получены некорректные координаты");
          return;
        }
        setUserLocation({
          lat: latitude,
          lng: longitude,
        });
      } else {
        console.warn("Не удалось определить координаты");
      }
    } catch (error) {
      console.error("Ошибка получения местоположения:", error);
    }
  };

  // Запрашиваем местоположение при монтировании
  useEffect(() => {
    getUserLocation();
  }, []);

  const markersData = events
    ? events.map((event: any) => ({
        id: event.id,
        name: event.name,
        startDate: event.startDate,
        endDate: event.endDate,
        description: event.description,
        avatar: getAvatarUri(event.avatar),
        coordinates: [event.latitude, event.longitude],
        participantsCount: event.participantCount,
      }))
    : [];

  const markersJson = JSON.stringify(markersData);
  // Определяем центр карты: если координаты пользователя доступны и не равны 0, используем их, иначе центр Москвы
  const defaultCenter =
    userLocation && !(userLocation.lat === 0 && userLocation.lng === 0)
      ? `[${userLocation.lat}, ${userLocation.lng}]`
      : `[${MOSCOW_COORDS[0]}, ${MOSCOW_COORDS[1]}]`;

  const htmlContent = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>Yandex Map</title>
      <script src="https://api-maps.yandex.ru/2.1/?apikey=${API_KEY}&lang=ru_RU"></script>
      <style>
        html, body, #map {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
        }
        .custom-marker {
          background-size: cover;
          border-radius: 50%;
          border: 0.5px solid #000;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        ymaps.ready(function () {
          var markerSize = Math.min(window.innerWidth, window.innerHeight) * 0.05;
          var markers = ${markersJson};
          var defaultCenter = ${defaultCenter};
          var myMap = new ymaps.Map("map", {
              center: defaultCenter,
              zoom: 9
          }, {
              searchControlProvider: "yandex#search"
          });
          
          var CustomMarkerLayout = ymaps.templateLayoutFactory.createClass(
            '<div class="custom-marker" style="width: ' + markerSize + 'px; height: ' + markerSize + 'px; background-image: url({{ properties.avatar }})"></div>'
          );
          
          markers.forEach(function(marker) {
            var placemark = new ymaps.Placemark(marker.coordinates, {
              name: marker.name,
              description: marker.description,
              avatar: marker.avatar,
              id: marker.id,
              participantsCount: marker.participantsCount
            }, {
              iconLayout: CustomMarkerLayout,
              iconShape: {
                type: "Circle",
                coordinates: [markerSize / 2, markerSize / 2],
                radius: markerSize / 2
              }
            });
            
            placemark.events.add("click", function () {
              var message = JSON.stringify(marker);
              if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                window.ReactNativeWebView.postMessage(message);
              } else if (window.parent && window.parent.postMessage) {
                window.parent.postMessage(message, "*");
              } else {
                console.log("Marker clicked:", marker);
              }
            });
            myMap.geoObjects.add(placemark);
          });
        });
      </script>
    </body>
  </html>
  `;

  // Для веб-версии: слушатель сообщений от iframe
  useEffect(() => {
    if (Platform.OS === "web") {
      const messageHandler = (event: MessageEvent) => {
        try {
          const data =
            typeof event.data === "string"
              ? JSON.parse(event.data)
              : event.data;
          if (!data || data.source === "react-devtools-bridge" || !data.id)
            return;
          openModal(data);
        } catch (error) {
          console.error("Ошибка парсинга данных из iframe", error);
        }
      };
      window.addEventListener("message", messageHandler);
      return () => window.removeEventListener("message", messageHandler);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Мероприятия на карте</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Поиск мероприятий..."
        value={search}
        onChangeText={setSearch}
      />
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Фильтровать по категории:</Text>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Все категории" value={null} />
          {categories?.map((cat: any) => (
            <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
          ))}
        </Picker>
      </View>
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Радиус поиска: {radius} км</Text>
        <Slider
          style={{ width: "100%", height: 40 }}
          minimumValue={1}
          maximumValue={50}
          step={1}
          value={radius}
          onValueChange={setRadius}
          minimumTrackTintColor="#007BFF"
          maximumTrackTintColor="#ccc"
        />
      </View>
      <TouchableOpacity style={styles.locationButton} onPress={getUserLocation}>
        <Text style={styles.locationButtonText}>Обновить местоположение</Text>
      </TouchableOpacity>
      <View style={styles.mapContainer}>
        {Platform.OS === "web" ? (
          <iframe
            title="Yandex Map"
            srcDoc={htmlContent}
            style={styles.iframe}
            frameBorder="0"
          />
        ) : (
          <WebView
            originWhitelist={["*"]}
            source={{ html: htmlContent }}
            style={styles.webview}
            onMessage={(event) => {
              try {
                const eventData = JSON.parse(event.nativeEvent.data);
                if (!eventData || !eventData.id) return;
                openModal(eventData);
              } catch (error) {
                console.error("Ошибка парсинга данных из WebView", error);
              }
            }}
          />
        )}
      </View>
      {modalVisible && selectedEvent && (
        <EventModal
          event={selectedEvent}
          imageUri={selectedEvent.avatar}
          visible={modalVisible}
          onClose={closeModal}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  title: { fontSize: 24, textAlign: "center", marginVertical: 10 },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 5,
    marginBottom: 10,
  },
  filterContainer: { marginBottom: 10 },
  filterLabel: { fontSize: 16, marginBottom: 5 },
  picker: { height: 50, width: "100%" },
  sliderContainer: { marginVertical: 10 },
  sliderLabel: { fontSize: 16, marginBottom: 5, textAlign: "center" },
  locationButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignSelf: "center",
  },
  locationButtonText: { color: "#fff", fontSize: 16 },
  mapContainer: { flex: 1 },
  webview: { flex: 1 },
  iframe: { width: "100%", height: "100%" },
});

export default YandexMapScreen;
