import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { useGetProfileQuery } from "../api/api";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/authSlice";
import { setUser } from "../features/userSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthChecker: React.FC = () => {
  const [tokensLoaded, setTokensLoaded] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();

  useEffect(() => {
    const loadTokens = async () => {
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

      setTokensLoaded(true);
    };

    loadTokens();
  }, [dispatch]);

  const { data, error, isLoading } = useGetProfileQuery(undefined, {
    skip: !tokensLoaded,
  });

  useEffect(() => {
    if (error) {
      const statusCode = (error as any).status;
      if (statusCode === 401 || statusCode === 403) {
        navigation.navigate("Login");
      }
    } else if (data?.accessToken && data?.refreshToken) {
      // Сохраняем токены
      dispatch(
        setCredentials({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        })
      );
      AsyncStorage.setItem("accessToken", data.accessToken).catch((err) =>
        console.error("Ошибка сохранения accessToken:", err)
      );
      AsyncStorage.setItem("refreshToken", data.refreshToken).catch((err) =>
        console.error("Ошибка сохранения refreshToken:", err)
      );

      navigation.navigate("Profile");
    }

    if (data?.id) {
      dispatch(
        setUser({
          userId: data.id,
          isAdmin: data.admin,
        })
      );
      // console.log("data.id", data.id);
      // AsyncStorage.setItem("userId", data.id).catch((err) =>
      //   console.error("Ошибка сохранения userId:", err)
      // );
    }
  }, [error, data, navigation, dispatch]);

  if (!tokensLoaded || isLoading) return <ActivityIndicator />;

  return null;
};

export default AuthChecker;
