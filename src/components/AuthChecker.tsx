import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { useGetProfileQuery } from "../api/api";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthChecker: React.FC = () => {
  const [tokensLoaded, setTokensLoaded] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  // Загружаем токены перед выполнением запроса
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
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
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
  }, [error, data, navigation, dispatch]);

  if (!tokensLoaded || isLoading) return <ActivityIndicator />;

  return null;
};

export default AuthChecker;
