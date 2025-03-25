// components/Alert.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";

type AlertProps = {
  message: string;
  type: "success" | "error";
  visible: boolean;
};

const Alert: React.FC<AlertProps> = ({ message, type, visible }) => {
  const [show, setShow] = useState(visible);
  console.log(visible);
  useEffect(() => {
    setShow(visible); // Синхронизируем state с пропсом visible
    if (visible) {
      const timer = setTimeout(() => {
        setShow(false);
      }, 3000); // Скрываем Alert через 3 секунды
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!show) return null;

  return (
    <View
      style={[
        styles.alertContainer,
        type === "success" ? styles.success : styles.error,
      ]}
    >
      <Text style={styles.alertText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  alertContainer: {
    position: "absolute",
    top: 50,
    left: "10%",
    right: "10%",
    padding: 15,
    borderRadius: 5,
    zIndex: 1,
    alignItems: "center",
  },
  success: {
    backgroundColor: "#28a745",
  },
  error: {
    backgroundColor: "#dc3545",
  },
  alertText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Alert;
