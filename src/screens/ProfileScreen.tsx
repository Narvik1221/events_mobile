import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useDeleteAccountMutation,
} from "../api/api";
import { useDispatch } from "react-redux";
import { logout } from "../features/authSlice";
import { clearUser } from "../features/userSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomButton from "../components/CustomButton";
import CustomModal from "../components/CustomModal"; // Убедитесь, что путь указан правильно
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { getAvatarUri } from "../lib/getAvatarUri";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { data, error, isLoading, refetch } = useGetProfileQuery();
  const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation();
  const [deleteAccount, { isLoading: deleting }] = useDeleteAccountMutation();
  const [showCloseButton, setShowCloseButton] = useState(true);
  const dispatch = useDispatch();
  const [confirmText, setConfirmText] = useState<any>(null);

  // Поля профиля
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [telegram, setTelegram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<any>();

  // Состояния для модального окна
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"success" | "error" | "confirm">(
    "confirm"
  );
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (data) {
      setFirstName(data.firstName || "");
      setLastName(data.lastName || "");
      setTelegram(data.telegram || "");
      setWhatsapp(data.whatsapp || "");
      setAvatar(data?.avatar || null);
    }
  }, [data]);

  const pickImage = async () => {
    if (Platform.OS === "web") {
      // Можно заменить на модальное окно, если требуется
      setModalMessage("Загрузка изображений недоступна в веб-версии.");
      setModalType("error");
      setModalVisible(true);
      return;
    }

    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      setModalMessage("Разрешите доступ к галерее.");
      setModalType("error");
      setModalVisible(true);
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0];
      setAvatar(selectedImage.uri);

      const fileInfo = await FileSystem.getInfoAsync(selectedImage.uri);
      if (!fileInfo.exists) {
        setModalMessage("Не удалось загрузить изображение.");
        setModalType("error");
        setModalVisible(true);
        return;
      }

      const fileName = selectedImage.uri.split("/").pop() || "image.jpg";
      const fileType = fileName.split(".").pop() || "jpg";

      setAvatarFile({
        uri: selectedImage.uri,
        name: fileName,
        type: `image/${fileType}`,
      });
    }
  };

  const handleUpdateProfile = async () => {
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("telegram", telegram);
    formData.append("whatsapp", whatsapp);

    if (avatarFile) {
      formData.append("avatar", avatarFile as any);
    }

    try {
      await updateProfile(formData).unwrap();
      setModalMessage("Профиль обновлен!");
      setModalType("success");
      setModalVisible(true);
      refetch();
    } catch (err) {
      console.error("Ошибка обновления профиля:", err);
      setModalMessage("Не удалось обновить профиль.");
      setModalType("error");
      setModalVisible(true);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
      dispatch(logout());
      dispatch(clearUser());
      navigation.navigate("Login");
    } catch (err) {
      console.error("Ошибка выхода:", err);
      setModalMessage("Не удалось выйти.");
      setModalType("error");
      setModalVisible(true);
    }
  };

  // Функция для показа модального окна с подтверждением
  const showModal = (
    message: string,
    type: "error" | "success" | "confirm",
    onConfirm?: () => void
  ) => {
    setModalMessage(message);
    setModalType(type);
    setConfirmAction(() => onConfirm || null);
    setModalVisible(true);
  };

  const handleDeleteAccount = async () => {
    // Показываем модальное окно подтверждения удаления аккаунта
    showModal(
      "Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить!",
      "confirm",
      async () => {
        try {
          await deleteAccount().unwrap();
          await AsyncStorage.removeItem("accessToken");
          await AsyncStorage.removeItem("refreshToken");
          dispatch(logout());
          setModalVisible(false);
          setConfirmAction(null);
          setShowCloseButton(false);
          setConfirmText("Продолжить");
          showModal("Аккаунт успешно удален.", "success", () => {
            navigation.navigate("Login");
            setModalVisible(false);
          });
        } catch (err) {
          console.error("Ошибка удаления аккаунта:", err);
          setModalVisible(false);
          showModal("Не удалось удалить аккаунт.", "error");
        }
      }
    );
  };
  const handleNavigateMyEvents = () => {
    navigation.navigate("EditEventsScreen");
  };
  if (isLoading)
    return <ActivityIndicator size="large" style={styles.loader} />;

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Профиль</Text>
        <CustomButton
          title="Мои мероприятия"
          onPress={handleNavigateMyEvents}
        />
        {error ? (
          <Text style={styles.errorText}>Ошибка загрузки профиля</Text>
        ) : (
          <View>
            <Image
              source={{ uri: getAvatarUri(avatar, false) }}
              style={styles.image}
            />
            {Platform.OS !== "web" && (
              <CustomButton title="Выбрать фото" onPress={pickImage} />
            )}

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
              placeholder="Telegram"
              value={telegram}
              onChangeText={setTelegram}
            />
            <TextInput
              style={styles.input}
              placeholder="WhatsApp"
              value={whatsapp}
              onChangeText={setWhatsapp}
            />

            <CustomButton
              title="Обновить профиль"
              onPress={handleUpdateProfile}
              disabled={updating}
            />
            <CustomButton title="Выйти" onPress={handleLogout} />
            <CustomButton
              title="Удалить аккаунт"
              onPress={handleDeleteAccount}
              disabled={deleting}
              style={styles.deleteButton}
            />
          </View>
        )}
      </ScrollView>

      {/* Модальное окно подтверждения/уведомления */}
      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalMessage}
        type={modalType}
        showCloseButton={showCloseButton}
        onConfirm={confirmAction || undefined}
        confirmText={confirmText || undefined}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10 },
  image: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginVertical: 10,
    borderRadius: 50,
  },
  deleteButton: { backgroundColor: "red", marginTop: 20 },
  loader: { flex: 1, justifyContent: "center" },
  errorText: { color: "red", textAlign: "center", marginVertical: 10 },
});

export default ProfileScreen;
