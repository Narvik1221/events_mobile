// components/ScreenContainer.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import BottomNavBar from "./BottomNavbar";
import Alert from "./Alert";
import { useSelector } from "react-redux";
import { RootState } from "../store/store"; // Предполагается, что store настроен и типизирован

type Props = {
  children: React.ReactNode;
};

const ScreenContainer: React.FC<Props> = ({ children }) => {
  return (
    <View style={styles.container}>
      <Alert />

      <View style={styles.content}>{children}</View>
      <BottomNavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f5f7f9",
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default ScreenContainer;
