import React, { useState, useEffect } from "react";
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
import CustomButton from "../components/CustomButton";
import { useCreateEventMutation, useGetCategoriesQuery } from "../api/api";
import AddressPickerModal from "../components/AddressPickerModal"; // путь к модальному окну

type Props = any;

const CreateEventScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<any>(null);

  const [pickerValue, setPickerValue] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const {
    data: categories,
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useGetCategoriesQuery();
  const [createEvent, { error, isLoading }] = useCreateEventMutation();

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

  // Функция создания события
  const handleCreateEvent = async () => {
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

    console.log("📤 Отправляем FormData:");
    formData.forEach((value, key) => console.log(`  ${key}: ${value}`));

    try {
      const response = await createEvent(formData).unwrap();
      console.log("✅ Ответ сервера:", response);
      navigation.navigate("Home");
    } catch (err) {
      console.error("❌ Ошибка создания мероприятия:", err);
    }
  };

  // Callback из AddressPickerModal – устанавливаем выбранные координаты
  const handleSelectLocation = (coords: [number, number]) => {
    setLatitude(String(coords[0]));
    setLongitude(String(coords[1]));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Создать мероприятие</Text>
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

      {/* Вместо ввода координат – кнопка для выбора адреса */}
      <CustomButton
        title={latitude && longitude ? "Адрес указан" : "Указать адрес"}
        onPress={() => setAddressModalVisible(true)}
      />
      {latitude && longitude && (
        <Text style={styles.coordsText}>
          Выбранные координаты: {latitude}, {longitude}
        </Text>
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
                {cat ? cat.name : catId} ×
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <CustomButton
        title="Выбрать фото"
        style={styles.button}
        onPress={pickImage}
      />
      {avatar && <Image source={{ uri: avatar }} style={styles.image} />}

      <CustomButton
        title="Создать"
        onPress={handleCreateEvent}
        disabled={isLoading}
      />

      {/* Модальное окно для выбора адреса */}
      <AddressPickerModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        onSelectLocation={handleSelectLocation}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
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
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 10,
    marginVertical: 10,
    alignItems: "center",
  },
  image: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginVertical: 10,
  },
  selectedCategoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  categoryTag: {
    backgroundColor: "#ddd",
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
    marginBottom: 5,
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

export default CreateEventScreen;
