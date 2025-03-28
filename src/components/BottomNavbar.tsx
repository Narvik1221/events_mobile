import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const BottomNavBar = () => {
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const isAdmin = useSelector((state: RootState) => state.user.isAdmin);
  const navigation = useNavigation<NavigationProp>();

  const handleEventsPress = () => {
    navigation.navigate("Events");
  };

  const handleCreateEventPress = () => {
    navigation.navigate("CreateEvent");
  };

  const handleProfilePress = () => {
    if (token) {
      navigation.navigate("Profile");
    } else {
      navigation.navigate("Login");
    }
  };
  const handleMyEventsPress = () => {
    if (token) {
      navigation.navigate("MyEvents");
    } else {
      navigation.navigate("Login");
    }
  };

  const handleEventsAdminPress = () => {
    if (token && isAdmin) {
      navigation.navigate("AdminEvents");
    } else {
      navigation.navigate("Login");
    }
  };

  const handleUsersAdminPress = () => {
    if (token && isAdmin) {
      navigation.navigate("AdminUsers");
    } else {
      navigation.navigate("Login");
    }
  };
  return (
    <View style={styles.container}>
      {isAdmin ? (
        <>
          <TouchableOpacity
            onPress={handleEventsAdminPress}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Мероприятия</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleUsersAdminPress}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Пользователи</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity onPress={handleEventsPress} style={styles.button}>
            <Text style={styles.buttonText}>Мероприятия</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCreateEventPress}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Создать мероприятие</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleMyEventsPress} style={styles.button}>
            <Text style={styles.buttonText}>Избранные</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity onPress={handleProfilePress} style={styles.button}>
        <Text style={styles.buttonText}>Профиль</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  button: {
    alignItems: "center",
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
  },
});

export default BottomNavBar;
