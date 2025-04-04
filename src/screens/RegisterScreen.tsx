import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRegisterMutation } from "../api/api";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import * as ImagePicker from "expo-image-picker";
import CustomButton from "../components/CustomButton";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [telegram, setTelegram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);

  const [register, { error, isLoading }] = useRegisterMutation();

  const handleRegister = async () => {
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("password", password);
    formData.append("telegram", telegram);
    formData.append("whatsapp", whatsapp);
    if (avatar) {
      const filename = avatar.split("/").pop()!;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      formData.append("avatar", { uri: avatar, name: filename, type } as any);
    }
    try {
      await register(formData).unwrap();
      navigation.navigate("Login");
    } catch (err) {
      console.error("Ошибка регистрации:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Регистрация</Text>
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
      <TextInput
        style={styles.input}
        placeholder="Telegram (опционально)"
        value={telegram}
        onChangeText={setTelegram}
      />
      <TextInput
        style={styles.input}
        placeholder="WhatsApp (опционально)"
        value={whatsapp}
        onChangeText={setWhatsapp}
      />

      {avatar && <Image source={{ uri: avatar }} style={styles.image} />}
      <CustomButton
        title={isLoading ? "Загрузка" : "Зарегистрироваться"}
        onPress={handleRegister}
        disabled={isLoading}
      />
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Уже есть аккаунт? Войдите</Text>
      </TouchableOpacity>
      {error && (
        <Text style={styles.error}>Ошибка регистрации. Проверьте данные.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 10,
    paddingVertical: 24,
  },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#cad3e5",
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#fdc63b",
    padding: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  buttonText: { color: "#000000", fontSize: 16 },
  link: { color: "blue", marginTop: 15, textAlign: "center" },
  error: { color: "red", marginTop: 10, textAlign: "center" },
  image: { width: 100, height: 100, alignSelf: "center", marginVertical: 10 },
});

export default RegisterScreen;
