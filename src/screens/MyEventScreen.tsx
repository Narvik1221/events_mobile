import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import {
  useGetUserEventsQuery,
  useGetCategoriesQuery,
  useLeaveEventMutation,
} from "../api/api";
import EventModal from "../components/EventModal";
import MyEventModal from "../components/MyEventModal";
import { getAvatarUri } from "../lib/getAvatarUri";
import CustomButton from "../components/CustomButton";

type EventType = {
  id: number;
  name: string;
  description: string;
  avatar?: any;
  participantsCount: number;
  categories?: { id: number; name: string }[];
};

const MyEventsScreen: React.FC = () => {
  const {
    data: events,
    error,
    isLoading,
    refetch,
  } = useGetUserEventsQuery(null as any) as any;

  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [leaveEvent] = useLeaveEventMutation();

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

  const handleLeaveEvent = async (eventId: number) => {
    try {
      await leaveEvent(eventId).unwrap();

      // closeModal();
    } catch (error) {
      console.error("Ошибка отмены участия", error);
    }
  };

  const renderItem = ({ item }: { item: EventType }) => {
    return (
      <View style={styles.item}>
        <View style={styles.itemTop}>
          <Image
            source={{ uri: getAvatarUri(item?.avatar) }}
            style={styles.avatar}
          />

          <View style={styles.textContainer}>
            <Text style={styles.eventName}>{item.name}</Text>
            <Text>{item.description}</Text>
          </View>
        </View>
        <CustomButton
          style={styles.change}
          isSmall
          onPress={() =>
            openModal({ ...item, avatar: getAvatarUri(item?.avatar) })
          }
          title="Подробнее"
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Избранное</Text>

      {isLoading ? (
        <Text>Загрузка...</Text>
      ) : error ? (
        <Text>{error?.data?.message ?? "Ошибка загрузки"}</Text>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}

      {modalVisible && (
        <MyEventModal
          event={selectedEvent}
          imageUri={imageUri}
          visible={modalVisible}
          onClose={closeModal}
          onDelete={handleLeaveEvent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, paddingVertical: 24 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  searchInput: {
    borderWidth: 1,
    borderColor: "#cad3e5",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  item: {
    flexDirection: "column",

    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#cad3e5",
  },
  itemTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 10,
  },
  change: { marginLeft: 0 },
  textContainer: { flex: 1, minWidth: 100 },
  eventName: { fontSize: 18, fontWeight: "bold" },
  filterContainer: { marginBottom: 20 },
  filterLabel: { fontSize: 16, marginBottom: 5 },

  btn: {
    width: 130,
  },
});

export default MyEventsScreen;
