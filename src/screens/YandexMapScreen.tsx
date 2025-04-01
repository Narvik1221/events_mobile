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
import { useDispatch } from "react-redux";
import { showAlert } from "../features/alertSlice";
import CustomButton from "../components/CustomButton";
import CustomModal from "../components/CustomModal";

const API_KEY = "b06fdb53-2726-4de6-8245-aa3ab977de84";
const MOSCOW_COORDS = [55.751574, 37.573856];

type EventStatus = any;

const YandexMapScreen: React.FC<{ navigation?: any }> = () => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  // Фильтры вынесены в модальное окно
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  // По умолчанию радиус не ограничен
  const [radius, setRadius] = useState<number | undefined>(undefined);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  // Новый фильтр по статусу мероприятия: "all", "current", "upcoming"
  const [eventStatus, setEventStatus] = useState<EventStatus>(null);

  // Состояние модального окна для фильтров
  const [filtersModalVisible, setFiltersModalVisible] = useState(false);

  // Передаём eventStatus только если выбран фильтр отличный от "all"
  const eventsQueryParams = {
    categoryId: selectedCategory || undefined,
    search: search.trim() ? search.trim() : undefined,
    radius: radius,
    userLat: userLocation?.lat,
    userLng: userLocation?.lng,
    eventStatus: eventStatus !== "all" ? eventStatus : undefined,
  };

  // Получаем данные из API
  const { data: categories } = useGetCategoriesQuery();
  const { data: events } = useGetEventsQuery(eventsQueryParams) as any;

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

  // Функция получения координат
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        dispatch(
          showAlert({
            message: "Разрешение на доступ к геолокации не получено",
            type: "error",
          })
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
      } as any);

      if (location && location.coords) {
        const { latitude, longitude } = location.coords;
        if (latitude === 0 && longitude === 0) {
          dispatch(
            showAlert({
              message: "Получены некорректные координаты",
              type: "error",
            })
          );
          return;
        }
        setUserLocation({ lat: latitude, lng: longitude });
        dispatch(
          showAlert({
            message: "Местоположение успешно определено",
            type: "success",
          })
        );
      } else {
        dispatch(
          showAlert({
            message: "Не удалось определить координаты",
            type: "error",
          })
        );
      }
    } catch (error) {
      dispatch(
        showAlert({
          message: `Ошибка получения местоположения: ${(error as any).message}`,
          type: "error",
        })
      );
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  // Массив маркеров для карты
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
  const defaultCenter =
    userLocation && !(userLocation.lat === 0 && userLocation.lng === 0)
      ? `[${userLocation.lat}, ${userLocation.lng}]`
      : `[${MOSCOW_COORDS[0]}, ${MOSCOW_COORDS[1]}]`;

  // HTML-код для карты
  const htmlContent = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
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
          border: 1px solid #3c3c3c;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
        <script>
      ymaps.ready(function () {
        // Определяем минимальный размер маркера в пикселях
        var minMarkerSize = 35;
        // Рассчитываем размер маркера как 5% от меньшей из сторон окна
        var calculatedSize = Math.min(window.innerWidth, window.innerHeight) * 0.05;
        // Устанавливаем окончательный размер маркера: либо рассчитанный, либо минимальный, если рассчитанный меньше
        var markerSize = Math.max(calculatedSize, minMarkerSize);

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
            participantsCount: marker.participantCount
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

  // Для веб-версии: слушатель сообщений из iframe
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

  // Активные фильтры: если введён поиск или выбрана категория или установлен радиус
  const activeFilters =
    search.trim() !== "" || selectedCategory !== null || radius !== undefined;

  // Функция сброса фильтров (категория, радиус и статус)
  const resetFilters = () => {
    setSelectedCategory(null);
    setRadius(undefined);
    setEventStatus("all");
    setFiltersModalVisible(false);
    setEventStatus(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Мероприятия на карте</Text>
      <View style={styles.searchRow}>
        {/* Кнопка параметров */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilters && styles.filterButtonActive,
          ]}
          onPress={() => setFiltersModalVisible(true)}
        >
          <Text style={styles.filterButtonText}>Параметры</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск меропритий..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

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
      {/* Модальное окно для фильтров с кнопкой "Сбросить" */}
      <CustomModal
        visible={filtersModalVisible}
        onClose={() => setFiltersModalVisible(false)}
        onConfirm={resetFilters}
        title="Фильтры"
        confirmText="Сбросить"
        cancelText="Продолжить"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalLabel}>Категория:</Text>
          <View style={styles.pickerContainer}>
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
          <Text style={styles.modalLabel}>
            Радиус поиска: {radius || "Не ограничен"} км
          </Text>
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={1}
            maximumValue={50}
            step={1}
            value={radius}
            onValueChange={setRadius}
            minimumTrackTintColor="#fdc63b"
            maximumTrackTintColor="#cad3e5"
          />
          {/* Панель фильтра по статусу мероприятия */}
          <Text style={[styles.modalLabel, { marginTop: 10 }]}>
            Статус мероприятия:
          </Text>
          <View style={styles.statusPanel}>
            <TouchableOpacity
              style={[
                styles.statusButton,
                eventStatus === null && styles.statusButtonActive,
              ]}
              onPress={() => setEventStatus(null)}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  eventStatus === null && styles.statusButtonTextActive,
                ]}
              >
                Все
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statusButton,
                eventStatus === "current" && styles.statusButtonActive,
              ]}
              onPress={() => setEventStatus("current")}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  eventStatus === "current" && styles.statusButtonTextActive,
                ]}
              >
                Текущие
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statusButton,
                eventStatus === "upcoming" && styles.statusButtonActive,
              ]}
              onPress={() => setEventStatus("upcoming")}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  eventStatus === "upcoming" && styles.statusButtonTextActive,
                ]}
              >
                Предстоящие
              </Text>
            </TouchableOpacity>
          </View>
          <CustomButton
            title="Обновить местоположение"
            onPress={getUserLocation}
          />
        </View>
      </CustomModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 24 },
  title: { fontSize: 24, textAlign: "center", padding: 10 },
  searchRow: {
    padding: 10,
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: 10,
  },
  filterButton: {
    padding: 10,
    backgroundColor: "#cad3e5",
    borderRadius: 5,
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: "#fdc63b",
  },
  filterButtonText: {
    color: "#3c3c3c",
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cad3e5",
    padding: 8,
    borderRadius: 5,
  },
  locationButton: {
    backgroundColor: "#fdc63b",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignSelf: "center",
  },
  locationButtonText: { color: "#3c3c3c", fontSize: 16 },
  mapContainer: { flex: 1 },
  webview: { flex: 1 },
  iframe: { width: "100%", height: "100%" },
  modalContent: { width: "100%" },
  modalLabel: { fontSize: 16, paddingVertical: 8, marginBottom: 5 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#cad3e5",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 10,
  },
  picker: { height: 50, width: "100%" },
  // Стили для панели статуса
  statusPanel: {
    flexDirection: "row",
    marginTop: 10,
    flexWrap: "wrap",
  },
  statusButton: {
    fontWeight: "bold",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "#cad3e5",
  },
  statusButtonActive: {
    backgroundColor: "#fdc63b",
  },
  statusButtonText: {
    color: "#3c3c3c",
    fontSize: 16,
  },
  statusButtonTextActive: {
    color: "white",
    fontWeight: "bold",
  },
});

export default YandexMapScreen;
