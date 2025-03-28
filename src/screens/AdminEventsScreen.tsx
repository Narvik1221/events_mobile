// screens/EventsScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  useGetEventsQuery,
  useGetCategoriesQuery,
  useJoinEventMutation,
  useDeleteEventMutation,
} from "../api/api";
import EventModal from "../components/EventModal";
import CustomModal from "../components/CustomModal";
import { getAvatarUri } from "../lib/getAvatarUri";

type EventType = {
  id: number;
  name: string;
  description: string;
  avatar?: any;
  participantsCount: number;
  categories?: { id: number; name: string }[];
};

type CategoryType = {
  id: number;
  name: string;
};

const EventsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  // Состояния для поиска и фильтрации по категории
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Запросы через RTK Query
  const { data: categories } = useGetCategoriesQuery();
  const {
    data: events,
    error,
    isLoading,
    refetch,
  } = useGetEventsQuery({
    categoryId: selectedCategory || undefined,
    search: search.trim() ? search.trim() : undefined,
  });

  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [joinEvent] = useJoinEventMutation();

  // Модальное окно подтверждения удаления
  const [deleteConfirmModalVisible, setDeleteConfirmModalVisible] =
    useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventType | null>(null);
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();

  const openModal = (event: EventType) => {
    setSelectedEvent(event);
    setImageUri(event.avatar || null);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedEvent(null);
    setImageUri(null);
  };

  // Показываем модальное окно подтверждения удаления для выбранного события
  const confirmDeleteEvent = (event: EventType) => {
    setEventToDelete(event);
    setDeleteConfirmModalVisible(true);
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    try {
      await deleteEvent(eventToDelete.id).unwrap();
      setDeleteConfirmModalVisible(false);
      setEventToDelete(null);
      refetch();
    } catch (error) {
      console.error("Ошибка удаления мероприятия", error);
      Alert.alert("Ошибка", "Не удалось удалить мероприятие");
    }
  };

  const renderItem = ({ item }: { item: EventType }) => (
    <View style={styles.eventItem}>
      <TouchableOpacity
        style={styles.item}
        onPress={() =>
          openModal({ ...item, avatar: getAvatarUri(item.avatar) })
        }
      >
        <Image
          source={{ uri: getAvatarUri(item.avatar) }}
          style={styles.avatar}
        />
        <View style={styles.textContainer}>
          <Text style={styles.eventName}>{item.name}</Text>
          <Text>{item.description}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => confirmDeleteEvent(item)}
      >
        <Text style={styles.deleteButtonText}>Удалить</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Список мероприятий</Text>

      {/* Поле для поиска */}
      <TextInput
        style={styles.searchInput}
        placeholder="Поиск мероприятий..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Фильтр по категориям */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Фильтровать по категории:</Text>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Все категории" value={null} />
          {categories?.map((category: CategoryType) => (
            <Picker.Item
              key={category.id}
              label={category.name}
              value={category.id}
            />
          ))}
        </Picker>
      </View>

      {isLoading ? (
        <Text>Загрузка...</Text>
      ) : error ? (
        <Text>Ошибка загрузки мероприятий</Text>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}

      {/* Модальное окно для просмотра события */}
      {modalVisible && selectedEvent && (
        <EventModal
          visible={modalVisible}
          onClose={closeModal}
          event={selectedEvent}
          imageUri={imageUri}
        />
      )}

      {/* Модальное окно подтверждения удаления */}
      {deleteConfirmModalVisible && (
        <CustomModal
          visible={deleteConfirmModalVisible}
          onClose={() => setDeleteConfirmModalVisible(false)}
          title="Вы уверены, что хотите удалить мероприятие?"
          type="confirm"
          onConfirm={handleDeleteEvent}
          confirmText="Удалить"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  filterContainer: { marginBottom: 20 },
  filterLabel: { fontSize: 16, marginBottom: 5 },
  picker: {
    height: 50,
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
  },
  eventItem: {
    marginBottom: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  textContainer: { flex: 1 },
  eventName: { fontSize: 18, fontWeight: "bold" },
  deleteButton: {
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 5,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EventsScreen;
