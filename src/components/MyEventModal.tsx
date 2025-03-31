// components/MyEventModal.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useDispatch } from "react-redux";
import { showAlert } from "../features/alertSlice";
import CustomModal from "./CustomModal";
import { useLeaveEventMutation } from "../api/api";

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
  const dispatch = useDispatch();
  const [leaveEvent] = useLeaveEventMutation();

  const handleDeleteEvent = async (eventId: number) => {
    try {
      await leaveEvent(eventId).unwrap();
      dispatch(
        showAlert({
          message: "Мероприятие успешно удалено.",
          type: "success",
        })
      );
    } catch (error) {
      console.error("Ошибка удаления мероприятия:", error);
      dispatch(
        showAlert({
          message: "Ошибка при удалении мероприятия.",
          type: "error",
        })
      );
    }
    onClose();
  };

  return (
    <CustomModal cancelText={"Закрыть"} visible={visible} onClose={onClose}>
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
          <Text style={styles.deleteButtonText}>Покинуть мероприятие</Text>
        )}
      </TouchableOpacity>
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
    backgroundColor: "#ff0000",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  deleteButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default MyEventModal;
