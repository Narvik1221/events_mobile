import React, { useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { WebView } from "react-native-webview";
import CustomModal from "./CustomModal"; // Проверьте корректность пути импорта
import { Dimensions } from "react-native";

// Ваш API-ключ Yandex Maps
const API_KEY = "b06fdb53-2726-4de6-8245-aa3ab977de84";

// Определяем высоту для карты (для web и native)
const MAP_HEIGHT = 300;

type AddressPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (coords: [number, number]) => void;
};

const AddressPickerModal: React.FC<AddressPickerModalProps> = ({
  visible,
  onClose,
  onSelectLocation,
}) => {
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(
    null
  );

  const htmlContent = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>Выбор адреса</title>
      <script src="https://api-maps.yandex.ru/2.1/?apikey=${API_KEY}&lang=ru_RU"></script>
      <style>
        html, body, #map {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        ymaps.ready(function () {
          var myMap = new ymaps.Map("map", {
              center: [55.751574, 37.573856],
              zoom: 9
          });
          var myPlacemark;

          // При клике на карту устанавливаем метку
          myMap.events.add("click", function (e) {
            var coords = e.get("coords");
            if (myPlacemark) {
              myMap.geoObjects.remove(myPlacemark);
            }
            myPlacemark = new ymaps.Placemark(coords, {}, {
              preset: "islands#redDotIcon"
            });
            myMap.geoObjects.add(myPlacemark);
            // Отправляем выбранные координаты в React Native
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ coords: coords }));
            } else if(window.parent && window.parent.postMessage) {
              // Для iframe в web-версии
              window.parent.postMessage(JSON.stringify({ coords: coords }), "*");
            }
          });
        });
      </script>
    </body>
  </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data && data.coords) {
        // Округляем координаты до 6 знаков после запятой
        const trimmedCoords: [number, number] = [
          Number(data.coords[0].toFixed(6)),
          Number(data.coords[1].toFixed(6)),
        ];
        setSelectedCoords(trimmedCoords);
      }
    } catch (error) {
      console.error("Ошибка обработки координат:", error);
    }
  };

  const handleConfirm = () => {
    if (selectedCoords) {
      onSelectLocation(selectedCoords);
      setSelectedCoords(null);
      onClose();
    }
  };

  const renderMap = () => {
    if (Platform.OS === "web") {
      return (
        <iframe
          title="Выбор адреса"
          srcDoc={htmlContent}
          style={styles.iframe}
          frameBorder="0"
        />
      );
    } else {
      return (
        <WebView
          originWhitelist={["*"]}
          source={{ html: htmlContent }}
          onMessage={handleMessage}
          style={styles.webview}
        />
      );
    }
  };

  return (
    <CustomModal
      visible={visible}
      onClose={() => {
        setSelectedCoords(null);
        onClose();
      }}
      title="Укажите адрес"
      confirmText="Создать"
      onConfirm={handleConfirm}
    >
      <View style={styles.mapContainer}>{renderMap()}</View>
      {!selectedCoords && (
        <Text style={styles.infoText}>
          Нажмите на карту, чтобы выбрать адрес
        </Text>
      )}
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    width: "100%",
    height: MAP_HEIGHT,
  },
  webview: { flex: 1 },
  iframe: { width: "100%", height: "100%" },
  infoText: {
    textAlign: "center",
    marginTop: 10,
    color: "#666",
  },
});

export default AddressPickerModal;
