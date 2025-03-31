import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { useGetEventParticipantsQuery } from "../api/api";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { getAvatarUri } from "../lib/getAvatarUri";

type RootStackParamList = {
  EventParticipantsScreen: { eventId: number };
};

type EventParticipantsRouteProp = RouteProp<
  RootStackParamList,
  "EventParticipantsScreen"
>;

const EventParticipantsScreen: React.FC = () => {
  const route = useRoute<EventParticipantsRouteProp>();
  const navigation = useNavigation();
  const { eventId } = route.params;
  const {
    data: participants,
    isLoading,
    error,
  } = useGetEventParticipantsQuery(eventId);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.item}>
      <Image
        source={{ uri: getAvatarUri(item.avatar, false) }}
        style={styles.avatar}
      />
      <View style={styles.textContainer}>
        <Text style={styles.name}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={styles.info}>Telegram: {item.telegram || "—"}</Text>
        <Text style={styles.info}>WhatsApp: {item.whatsapp || "—"}</Text>
        <Text style={styles.info}>
          Регистрация: {new Date(item.registrationDate).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.title}>Участники мероприятия</Text>
      </View>

      {isLoading && <Text>Загрузка участников...</Text>}
      {error && <Text>Ошибка загрузки участников</Text>}
      {participants && (
        <FlatList
          data={participants}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingVertical: 24,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 10,
    position: "absolute",
    left: 0,
    right: 0,
    pointerEvents: "none",
    fontWeight: "bold",
  },
  // Стили для renderItem аналогичны тем, что используются в MyEventsScreen:
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#cad3e5",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    minWidth: 100,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  info: {
    fontSize: 16,
  },
});

export default EventParticipantsScreen;
