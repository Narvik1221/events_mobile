// components/EventModal.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import CustomModal from "./CustomModal";
import { useDispatch } from "react-redux";
import { showAlert } from "../features/alertSlice";
import { useJoinEventMutation } from "../api/api";

type EventModalProps = {
  visible: boolean;
  onClose: () => void;
  event?: any;

  imageUri?: string | null;
  isJoining?: boolean;
};

const EventModal: React.FC<EventModalProps> = ({
  visible,
  onClose,
  event,

  isJoining,
  imageUri,
}) => {
  const dispatch = useDispatch();
  const [joinEvent] = useJoinEventMutation();
  const onJoinHandle = async (eventId: number) => {
    try {
      await joinEvent(eventId).unwrap();
      dispatch(
        showAlert({
          message: "Вы записались",
          type: "success",
        })
      );
    } catch (error) {
      console.error("Ошибка при записи:", error);
      dispatch(
        showAlert({
          message: "Ошибка при записи",
          type: "error",
        })
      );
    }
    onClose();
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
        onPress={() => onJoinHandle(event?.id)}
        disabled={isJoining}
      >
        {isJoining ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.joinButtonText}>Записаться</Text>
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
  infoContainer: {
    width: "100%",
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
  },
  joinButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  joinButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EventModal;
