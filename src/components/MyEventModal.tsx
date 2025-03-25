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

type MyEventModalProps = {
  visible: boolean;
  onClose: () => void;
  event?: any;
  onDelete?: (eventId: number) => Promise<any>;
  imageUri?: string | null;
  isDeleting?: boolean;
};

const MyEventModal: React.FC<MyEventModalProps> = ({
  visible,
  onClose,
  event,
  onDelete,
  isDeleting,
  imageUri,
}) => {
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [alertVisible, setAlertVisible] = useState(false);

  const handleDeleteEvent = async (eventId: number) => {
    if (!onDelete) return;

    try {
      await onDelete(eventId);
      setAlertMessage("Мероприятие успешно удалено.");
      setAlertType("success");
      setAlertVisible(true);
      onClose();
    } catch (error) {
      console.error("Ошибка удаления мероприятия:", error);
      setAlertMessage("Ошибка при удалении мероприятия.");
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
        style={styles.deleteButton}
        onPress={() => handleDeleteEvent(event?.id)}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.deleteButtonText}>Удалить мероприятие</Text>
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
  deleteButton: {
    backgroundColor: "#FF3B30",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  deleteButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default MyEventModal;
