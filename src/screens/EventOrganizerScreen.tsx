// screens/EventOrganizerScreen.tsx
import React from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import { useGetEventCreatorQuery } from "../api/api";
import { useRoute, RouteProp } from "@react-navigation/native";
import { getAvatarUri } from "../lib/getAvatarUri";

type RootStackParamList = {
  EventOrganizer: { eventId: number };
};

type OrganizerRouteProp = RouteProp<RootStackParamList, "EventOrganizer">;

const EventOrganizerScreen: React.FC = () => {
  const route = useRoute<OrganizerRouteProp>();
  const { eventId } = route.params;

  const {
    data: organizer,
    isLoading,
    isError,
  } = useGetEventCreatorQuery(eventId);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Организатор мероприятия</Text>

      {isLoading && <ActivityIndicator size="large" />}
      {isError && (
        <Text style={styles.errorText}>
          Ошибка загрузки информации об организаторе
        </Text>
      )}
      {organizer && (
        <View style={styles.card}>
          <Image
            source={{
              uri: getAvatarUri(organizer.avatar, false),
            }}
            style={styles.avatar}
          />
          <View style={styles.info}>
            <Text style={styles.name}>
              {organizer.firstName} {organizer.lastName}
            </Text>

            <Text style={styles.text}>
              Telegram: {organizer.telegram || "—"}
            </Text>
            <Text style={styles.text}>
              WhatsApp: {organizer.whatsapp || "—"}
            </Text>
            <Text style={styles.text}>
              Зарегистрирован: {new Date(organizer.createdAt).toLocaleString()}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingTop: 44,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
  },
  text: {
    fontSize: 16,
    marginBottom: 4,
  },
});

export default EventOrganizerScreen;
