import React from "react";
import { Modal, View, StyleSheet, TouchableOpacity, Text } from "react-native";

type ModalType = "error" | "success" | "confirm";

type CustomModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm?: () => void; // ✅ Новый проп
  children?: React.ReactNode;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  showCloseButton?: boolean;
  type?: ModalType;
};

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  onConfirm,
  children,
  title,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  showCloseButton = true,
  type,
}) => {
  const modalStyle =
    type === "error"
      ? styles.errorModal
      : type === "success"
      ? styles.successModal
      : styles.defaultModal;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, modalStyle]}>
          {title && <Text style={styles.title}>{title}</Text>}
          {children}
          <View style={styles.buttonContainer}>
            {onConfirm && (
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={onConfirm}
              >
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              </TouchableOpacity>
            )}
            {showCloseButton && (
              <TouchableOpacity style={styles.confirmButton} onPress={onClose}>
                <Text style={styles.confirmButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    maxWidth: 500,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 15,
    justifyContent: "space-between",
    width: "100%",
  },
  confirmButton: {
    padding: 10,
    backgroundColor: "#fdc63b",
    borderRadius: 5,
  },
  confirmButtonText: {
    fontSize: 16,
    color: "#3c3c3cs",
  },
  closeButton: { padding: 10 },
  closeButtonText: { fontSize: 16, color: "#3c3c3cs" },

  defaultModal: { backgroundColor: "white" },
  errorModal: {},
  successModal: {},
});

export default CustomModal;
