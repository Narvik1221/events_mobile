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
import CustomButton from "../components/CustomButton";
import { showAlert } from "../features/alertSlice";
import { useDispatch } from "react-redux";
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
  // Состояния для поиска и фильтрации
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  // Состояние модального окна для фильтров
  const [filtersModalVisible, setFiltersModalVisible] = useState(false);
  const dispatch = useDispatch();
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

  // Состояния для модального окна просмотра события
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
    setImageUri(event.avatar ? getAvatarUri(event.avatar) : null);
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
      dispatch(
        showAlert({
          message: `мероприятие успешно удалено!`,
          type: "success",
        })
      );
    } catch (error) {
      dispatch(
        showAlert({
          message: `Ошибка удаления мероприятия: ${error?.data?.message}`,
          type: "error",
        })
      );
    }
  };
  const activeFilters = search.trim() !== "" || selectedCategory !== null;

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
          <Text numberOfLines={2} style={styles.eventDescription}>
            {item.description}
          </Text>
        </View>
      </TouchableOpacity>
      <CustomButton
        type="logout"
        onPress={() => confirmDeleteEvent(item)}
        title="Удалить"
      ></CustomButton>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Список мероприятий</Text>

      <View style={styles.searchRow}>
        {/* Кнопка параметров */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilters && styles.filterButtonActive,
          ]}
          onPress={() => setFiltersModalVisible(true)}
        >
          <Text style={styles.filterButtonText}>Параметры</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск меропритий..."
          value={search}
          onChangeText={setSearch}
        />
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

      {/* Модальное окно для фильтров */}
      <CustomModal
        visible={filtersModalVisible}
        onClose={() => setFiltersModalVisible(false)}
        onConfirm={() => setFiltersModalVisible(false)}
        title="Фильтры"
        confirmText="Применить"
        cancelText="Отмена"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalLabel}>Категория:</Text>
          <View style={styles.pickerContainer}>
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
        </View>
      </CustomModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 24, paddingLeft: 10, paddingRight: 10 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },

  eventItem: { marginBottom: 10 },
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
  eventDescription: { fontSize: 14, color: "#555" },
  deleteButton: {
    backgroundColor: "#d9534f",
  },
  deleteButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContent: { width: "100%" },
  modalLabel: { fontSize: 16, marginBottom: 5 },
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
  searchRow: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: 10,
  },
  filterButton: {
    padding: 10,
    backgroundColor: "#cad3e5",
    borderRadius: 5,
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: "#fdc63b",
  },
  filterButtonText: {
    color: "#000000",
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cad3e5",
    padding: 8,
    borderRadius: 5,
  },
});

export default EventsScreen;
