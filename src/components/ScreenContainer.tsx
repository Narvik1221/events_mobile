import React from "react";
import { View, StyleSheet } from "react-native";
import BottomNavBar from "./BottomNavbar";
type Props = {
  children: any;
};
const ScreenContainer: React.FC<Props> = ({ children }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>{children}</View>
      <BottomNavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default ScreenContainer;
