import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { hideAlert } from "../features/alertSlice";

const Alert: React.FC = () => {
  const dispatch = useDispatch();
  const { message, type, visible } = useSelector(
    (state: RootState) => state.alert
  );

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        dispatch(hideAlert());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, dispatch]);

  if (!visible) return null;

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
    zIndex: 1000,
    alignItems: "center",
  },
  success: {
    backgroundColor: "#1b7c46",
  },
  error: {
    backgroundColor: "#ff0000",
  },
  alertText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Alert;
