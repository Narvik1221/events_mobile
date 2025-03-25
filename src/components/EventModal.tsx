import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Alert from "./Alert";
import CustomModal from "./CustomModal";

type EventModalProps = {
  visible: boolean;
  onClose: () => void;
  event?: any;
  onJoin?: any;
  imageUri?: any;
  isJoining?: boolean;
};

const EventModal: React.FC<EventModalProps> = ({
  visible,
  onClose,
  event,
  onJoin,
  isJoining,
  imageUri,
}) => {
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [alertVisible, setAlertVisible] = useState(false);

  const handleJoinEvent = async (eventId: number) => {
    if (!onJoin) return;

    try {
      const response = await onJoin(eventId);

      console.log("Response:", response);

      const message = response?.data?.message || "Неизвестный ответ от сервера";
      const isSuccess = response?.status === 200;

      setAlertMessage(message);
      setAlertType(isSuccess ? "success" : "error");
      setAlertVisible(true);
    } catch (error) {
      console.error("Ошибка запроса:", error);
      setAlertMessage("Ошибка при запросе участия.");
      setAlertType("error");
      setAlertVisible(true);
    }
  };

  return (
    <CustomModal visible={visible} onClose={onClose}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.modalImage} />
      ) : (
        <Text style={styles.noImageText}>Нет изображения</Text>
      )}

      <Text style={styles.modalTitle}>{event?.name}</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Дата начала: {new Date(event?.startDate).toLocaleString()}
        </Text>
        <Text style={styles.infoText}>
          Дата окончания: {new Date(event?.endDate).toLocaleString()}
        </Text>
        <Text style={styles.infoText}>Описание: {event?.description}</Text>
        <Text style={styles.infoText}>
          Участников: {event?.participantCount || 0}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.joinButton}
        onPress={() => handleJoinEvent(event?.id)}
        disabled={isJoining}
      >
        {isJoining ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.joinButtonText}>Записаться</Text>
        )}
      </TouchableOpacity>

      <Alert message={alertMessage} type={alertType} visible={alertVisible} />
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  modalImage: {
    width: "100%",
    height: undefined,
    aspectRatio: 16 / 9,
    borderRadius: 10,
    marginBottom: 15,
  },
  noImageText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#aaa",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  infoContainer: { width: "100%", marginBottom: 20 },
  infoText: { fontSize: 16, marginBottom: 5 },
  joinButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  joinButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default EventModal;
