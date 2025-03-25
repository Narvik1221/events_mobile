import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ProfileScreen from "../screens/ProfileScreen";
import EventsScreen from "../screens/EventsScreen";
import CreateEventScreen from "../screens/CreateEventScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { setCredentials } from "../features/authSlice";
import ScreenContainer from "../components/ScreenContainer";
import AuthChecker from "../components/AuthChecker";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Profile: undefined;
  Events: undefined;
  CreateEvent: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const dispatch = useDispatch();

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

  return (
    <NavigationContainer>
      <ScreenContainer>
        <AuthChecker />
        <Stack.Navigator
          initialRouteName="Events"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Events" component={EventsScreen} />
          <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      </ScreenContainer>
    </NavigationContainer>
  );
};

export default AppNavigator;
