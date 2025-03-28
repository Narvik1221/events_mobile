import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ProfileScreen from "../screens/ProfileScreen";

import CreateEventScreen from "../screens/CreateEventScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { setCredentials } from "../features/authSlice";
import ScreenContainer from "../components/ScreenContainer";
import AuthChecker from "../components/AuthChecker";
import MyEventsScreen from "../screens/MyEventScreen";
import YandexMapScreen from "../screens/YandexMapScreen";
import EditEventsScreen from "../screens/EditEventsScreen";
import EditEventScreen from "../screens/EditEventScreen";
import AdminEventsScreen from "../screens/AdminEventsScreen";
import AdminUsersScreen from "../screens/AdminUsersScreen";
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Profile: undefined;
  Events: undefined;
  CreateEvent: undefined;
  MyEvents: undefined;
  EditEventsScreen: undefined;
  EditEventScreen: any;
  AdminUsers: undefined;
  AdminEvents: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const dispatch = useDispatch();
  const isAdmin = useSelector((state: RootState) => state.user.isAdmin);

  useEffect(() => {
    const loadTokens = async () => {
      try {
        const storedAccessToken = await AsyncStorage.getItem("accessToken");
        const storedRefreshToken = await AsyncStorage.getItem("refreshToken");
        if (storedAccessToken && storedRefreshToken) {
          dispatch(
            setCredentials({
              accessToken: storedAccessToken,
              refreshToken: storedRefreshToken,
            })
          );
        }
      } catch (err) {
        console.error("Ошибка загрузки токенов:", err);
      }
    };
    loadTokens();
  }, [dispatch]);
  const initialRoute = isAdmin ? "AdminEvents" : "Events";
  return (
    <NavigationContainer>
      <ScreenContainer>
        <AuthChecker />
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{ headerShown: false }}
        >
          {/* <Stack.Screen name="Events" component={EventsScreen} /> */}
          <Stack.Screen name="EditEventsScreen" component={EditEventsScreen} />
          <Stack.Screen name="EditEventScreen" component={EditEventScreen} />
          <Stack.Screen name="Events" component={YandexMapScreen} />
          <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="MyEvents" component={MyEventsScreen} />
          <Stack.Screen name="AdminEvents" component={AdminEventsScreen} />
          <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
        </Stack.Navigator>
      </ScreenContainer>
    </NavigationContainer>
  );
};

export default AppNavigator;
