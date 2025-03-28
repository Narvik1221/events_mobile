import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useGetProfileQuery, useLoginMutation } from "../api/api";
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/authSlice";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomButton from "../components/CustomButton";
type Props = any;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [login, { data, error, isLoading }] = useLoginMutation() as any;
  const { refetch } = useGetProfileQuery();
  const dispatch = useDispatch();

  useEffect(() => {
    if (data && data.accessToken && data.refreshToken) {
      dispatch(
        setCredentials({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        })
      );
      // Сохраняем токены в AsyncStorage
      AsyncStorage.setItem("accessToken", data.accessToken)
        .then(() => console.log("Access token сохранён"))
        .catch((err) => console.error("Ошибка сохранения access token:", err));
      AsyncStorage.setItem("refreshToken", data.refreshToken)
        .then(() => console.log("Refresh token сохранён"))
        .catch((err) => console.error("Ошибка сохранения refresh token:", err));
      refetch();
      navigation.navigate("Profile");
    }
  }, [data]);

  const handleLogin = async () => {
    try {
      await login({ firstName, lastName, password }).unwrap();
    } catch (err) {
      console.error("Ошибка входа:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Вход</Text>
      <TextInput
        style={styles.input}
        placeholder="Имя"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Фамилия"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Пароль"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <CustomButton title="Войти" onPress={handleLogin} disabled={isLoading} />
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>Нет аккаунта? Зарегистрируйтесь</Text>
      </TouchableOpacity>
      {error && (
        <Text style={styles.error}>
          {error?.data?.message ?? `Ошибка входа. Проверьте данные.`}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10 },
  link: { color: "blue", marginTop: 15, textAlign: "center" },
  error: { color: "red", marginTop: 10, textAlign: "center" },
});

export default LoginScreen;
