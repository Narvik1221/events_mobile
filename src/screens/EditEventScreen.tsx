import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useDispatch } from "react-redux";
import CustomButton from "../components/CustomButton";
import {
  useGetCategoriesQuery,
  useUpdateEventMutation,
  useDeleteUserEventMutation,
} from "../api/api";
import AddressPickerModal from "../components/AddressPickerModal";
import CustomModal from "../components/CustomModal";
import { showAlert } from "../features/alertSlice"; // пример импорта экшена

type Props = any;

const EditEventScreen: React.FC<Props> = ({ route, navigation }) => {
  const { event } = route.params;
  const dispatch = useDispatch();

  // Инициализируем выбранные категории из event.categories (если они есть) или из event.categoryIds
  const initialSelectedCategories = event.categories
    ? event.categories.map((cat: any) => cat.id)
    : event.categoryIds || [];

  // Инициализируем поля данными из выбранного мероприятия
  const [name, setName] = useState(event.name);
  const [startDate, setStartDate] = useState(new Date(event.startDate));
  const [endDate, setEndDate] = useState(new Date(event.endDate));
  const [latitude, setLatitude] = useState(String(event.latitude));
  const [longitude, setLongitude] = useState(String(event.longitude));
  const [description, setDescription] = useState(event.description);
  const [avatar, setAvatar] = useState(event.avatar);
  const [avatarFile, setAvatarFile] = useState<any>(null);

  const [pickerValue, setPickerValue] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    initialSelectedCategories
  );
  const [confirmText, setConfirmText] = useState<any>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showCloseButton, setShowCloseButton] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"success" | "error" | "confirm">(
    "confirm"
  );
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  const {
    data: categories,
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useGetCategoriesQuery();

  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteUserEventMutation();

  // Состояние для модального окна выбора адреса
  const [addressModalVisible, setAddressModalVisible] = useState(false);

  // Функция выбора изображения
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Доступ запрещен",
        "Разрешите доступ к галерее, чтобы выбрать изображение."
      );
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
        Alert.alert("Ошибка", "Не удалось загрузить изображение.");
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

  // Добавление выбранной категории
  const addCategory = () => {
    if (pickerValue !== null && !selectedCategories.includes(pickerValue)) {
      setSelectedCategories([...selectedCategories, pickerValue]);
    } else if (pickerValue === null) {
      Alert.alert("Ошибка", "Выберите категорию для добавления.");
    } else {
      Alert.alert("Информация", "Эта категория уже выбрана.");
    }
  };

  // Удаление категории из списка выбранных
  const removeCategory = (catId: number) => {
    setSelectedCategories(selectedCategories.filter((id) => id !== catId));
  };

  // Функция обновления мероприятия
  const handleUpdateEvent = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("startDate", startDate.toISOString());
    formData.append("endDate", endDate.toISOString());
    formData.append("latitude", String(latitude));
    formData.append("longitude", String(longitude));
    formData.append("description", description || "");
    formData.append("categoryIds", JSON.stringify(selectedCategories));

    if (avatarFile) {
      formData.append("avatar", avatarFile as any);
    }

    console.log("Отправляем данные для обновления:");
    formData.forEach((value, key) => console.log(`${key}: ${value}`));

    try {
      const response = await updateEvent({
        id: event.id,
        data: formData,
      }).unwrap();
      console.log("Ответ сервера:", response);
      dispatch(
        showAlert({
          message: `Мероприятие успешно обновлено!`,
          type: "success",
        })
      );
      navigation.navigate("EditEventsScreen");
    } catch (err) {
      dispatch(
        showAlert({
          message: `Ошибка обновления мероприятия: ${err}`,
          type: "error",
        })
      );
      console.error("Ошибка обновления мероприятия:", err);
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

  const handleDeleteEvent = async () => {
    showModal(
      "Вы уверены, что хотите удалить мероприятие? Это действие нельзя отменить!",
      "confirm",
      async () => {
        try {
          await deleteEvent({ id: event.id }).unwrap();
          setModalVisible(false);
          setConfirmAction(null);
          setShowCloseButton(false);
          setConfirmText("Продолжить");
          dispatch(
            showAlert({
              message: "Мероприятие успешно удалено",
              type: "success",
            })
          );
        } catch (err) {
          console.error("Ошибка удаления мероприятия:", err);
          setModalVisible(false);
          dispatch(
            showAlert({
              message: "Не удалось удалить мероприятие",
              type: "error",
            })
          );
        }
      }
    );
  };

  // Callback из AddressPickerModal – устанавливаем выбранные координаты
  const handleSelectLocation = (coords: [number, number]) => {
    setLatitude(String(coords[0]));
    setLongitude(String(coords[1]));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Редактировать мероприятие</Text>
      <TextInput
        style={styles.input}
        placeholder="Название"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Дата начала:</Text>
      <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
        <Text style={styles.input}>{startDate.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(_, date) => {
            if (date) {
              setStartDate(date);
              setShowStartDatePicker(false);
            }
          }}
        />
      )}

      <Text style={styles.label}>Дата конца:</Text>
      <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
        <Text style={styles.input}>{endDate.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(_, date) => {
            if (date) {
              setEndDate(date);
              setShowEndDatePicker(false);
            }
          }}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Описание"
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Выберите категорию для добавления:</Text>
      {categoriesLoading ? (
        <Text>Загрузка категорий...</Text>
      ) : categoriesError ? (
        <Text>Ошибка загрузки категорий.</Text>
      ) : (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={pickerValue}
            onValueChange={(itemValue) => setPickerValue(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Выберите категорию" value={null} />
            {categories.map((category: any) => (
              <Picker.Item
                key={category.id}
                label={category.name}
                value={category.id}
              />
            ))}
          </Picker>
        </View>
      )}
      <CustomButton title="Добавить категорию" onPress={addCategory} />
      <View style={styles.selectedCategoriesContainer}>
        {selectedCategories.map((catId) => {
          const cat = categories?.find((c: any) => c.id === catId);
          return (
            <TouchableOpacity
              key={catId}
              style={styles.categoryTag}
              onPress={() => removeCategory(catId)}
            >
              <Text style={styles.categoryText}>
                {`${cat ? cat.name : catId} ×`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <CustomButton
        title={latitude && longitude ? "Адрес указан" : "Указать адрес"}
        onPress={() => setAddressModalVisible(true)}
      />
      {latitude && longitude && (
        <Text style={styles.coordsText}>
          Выбранные координаты: {latitude}, {longitude}
        </Text>
      )}

      <CustomButton
        title="Выбрать фото"
        style={styles.button}
        onPress={pickImage}
      />
      {avatar && <Image source={{ uri: avatar }} style={styles.image} />}

      <CustomButton
        title={isUpdating ? "Загрузка" : "Обновить"}
        onPress={handleUpdateEvent}
        disabled={isUpdating}
      />

      <CustomButton
        title={isDeleting ? "Удаляется..." : "Удалить мероприятие"}
        onPress={handleDeleteEvent}
        style={styles.deleteButton}
      />

      <AddressPickerModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        onSelectLocation={handleSelectLocation}
        initialCoordinates={
          latitude && longitude
            ? {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
              }
            : undefined
        }
      />

      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalMessage}
        type={modalType}
        showCloseButton={showCloseButton}
        onConfirm={confirmAction || undefined}
        confirmText={confirmText || undefined}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 10,
    paddingVertical: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cad3e5",
    padding: 10,
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#cad3e5",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  button: {
    backgroundColor: "#fdc63b",
    padding: 10,
    marginVertical: 10,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#d9534f",
    padding: 10,
    marginVertical: 10,
    alignItems: "center",
  },
  image: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginVertical: 10,
    borderRadius: 50,
  },
  selectedCategoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginVertical: 10,
    gap: 10,
  },
  categoryTag: {
    backgroundColor: "#ddd",
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryText: {
    fontSize: 14,
    color: "#333",
  },
  coordsText: {
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },
});

export default EditEventScreen;
