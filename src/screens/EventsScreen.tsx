import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  useGetEventsQuery,
  useGetCategoriesQuery,
  useJoinEventMutation,
} from "../api/api";
import EventModal from "../components/EventModal";

type EventType = {
  id: number;
  name: string;
  description: string;
  avatar?: string;
  participantsCount: number;
  categories?: { id: number; name: string }[];
};

type CategoryType = {
  id: number;
  name: string;
};

const EventsScreen: React.FC<{ navigation: any }> = () => {
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

  const handleJoinEvent = async (eventId: number) => {
    try {
      await joinEvent(eventId).unwrap();
      refetch(); // Обновляем список событий
      if (selectedEvent) {
        setSelectedEvent({
          ...selectedEvent,
          participantsCount: selectedEvent.participantsCount + 1,
        });
      }
    } catch (error) {
      console.error("Ошибка записи на мероприятие", error);
    }
  };

  const renderItem = ({ item }: { item: EventType }) => {
    let avatarUri = item.avatar;
    if (
      avatarUri &&
      !avatarUri.startsWith("http://") &&
      avatarUri.includes("uploads")
    ) {
      const parts = avatarUri.includes("\\")
        ? avatarUri.split("\\")
        : avatarUri.split("/");
      avatarUri = "http://192.168.1.110:3000/uploads/events/" + parts.pop();
    }

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => openModal({ ...item, avatar: avatarUri })}
      >
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : null}
        <View style={styles.textContainer}>
          <Text style={styles.eventName}>{item.name}</Text>
          <Text>{item.description}</Text>
        </View>
      </TouchableOpacity>
    );
  };

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

      {modalVisible && (
        <EventModal
          event={selectedEvent}
          imageUri={imageUri}
          visible={modalVisible}
          onClose={closeModal}
          onJoin={handleJoinEvent}
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
  filterContainer: { marginBottom: 20 },
  filterLabel: { fontSize: 16, marginBottom: 5 },
  picker: {
    height: 50,
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
  },
});

export default EventsScreen;
