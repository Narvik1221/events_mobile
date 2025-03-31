import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

// Импорт SVG-иконок как компонентов
import EventsIcon from "../../assets/events.svg";
import CreateEventIcon from "../../assets/create.svg";
import FavoritesIcon from "../../assets/heart.svg";
import ProfileIcon from "../../assets/profile.svg";
import AdminEventsIcon from "../../assets/events.svg";
import AdminUsersIcon from "../../assets/users.svg";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const BottomNavBar = () => {
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const isAdmin = useSelector((state: RootState) => state.user.isAdmin);
  const navigation = useNavigation<NavigationProp>();

  // Получаем текущий маршрут из навигационного состояния
  const currentRouteName = useNavigationState((state) => {
    if (state && state.routes && state.routes[state.index]) {
      return state.routes[state.index].name;
    }
    return "";
  });

  // Значение по умолчанию соответствует initialRouteName, установленному в навигаторе
  const defaultRoute = isAdmin ? "AdminEvents" : "Events";
  const activeRouteName = currentRouteName || defaultRoute;

  const getIconColor = (routeName: string) => {
    return activeRouteName === routeName ? "#fdc63b" : "#3c3c3c";
  };

  const handleNavigation = (routeName: keyof RootStackParamList) => {
    navigation.navigate(routeName);
  };

  return (
    <View style={styles.container}>
      {isAdmin ? (
        <>
          <TouchableOpacity
            onPress={() => handleNavigation("AdminEvents")}
            style={styles.button}
          >
            <AdminEventsIcon
              width={32}
              height={32}
              color={getIconColor("AdminEvents")}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleNavigation("AdminUsers")}
            style={styles.button}
          >
            <AdminUsersIcon
              width={32}
              height={32}
              color={getIconColor("AdminUsers")}
            />
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity
            onPress={() => handleNavigation("Events")}
            style={styles.button}
          >
            <EventsIcon width={32} height={32} color={getIconColor("Events")} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleNavigation("CreateEvent")}
            style={styles.button}
          >
            <CreateEventIcon
              width={32}
              height={32}
              color={getIconColor("CreateEvent")}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleNavigation("MyEvents")}
            style={styles.button}
          >
            <FavoritesIcon
              width={32}
              height={32}
              color={getIconColor("MyEvents")}
            />
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity
        onPress={() => handleNavigation(token ? "Profile" : "Login")}
        style={styles.button}
      >
        <ProfileIcon width={32} height={32} color={getIconColor("Profile")} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#cad3e5",
    backgroundColor: "#fff",
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  button: {
    alignItems: "center",
    flex: 1,
  },
});

export default BottomNavBar;
