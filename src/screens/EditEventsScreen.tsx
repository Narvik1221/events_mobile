import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { useGetMyEventsQuery } from "../api/api";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import Constants from "expo-constants";
import { getAvatarUri } from "../lib/getAvatarUri";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EditEventsScreen: React.FC = () => {
  const { data: events, isLoading, error } = useGetMyEventsQuery();
  const navigation = useNavigation<NavigationProp>();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text>Загрузка мероприятий...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Ошибка загрузки мероприятий.</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.item}>
        <Image
          source={{ uri: getAvatarUri(item.avatar) }}
          style={styles.image}
        />

        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.name}</Text>
          <Text>{item.description}</Text>
          <Text>
            {new Date(item.startDate).toLocaleDateString()} –{" "}
            {new Date(item.endDate).toLocaleDateString()}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate("EditEventScreen", { event: item })
          }
        >
          <Text style={styles.buttonText}>Редактировать</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  // item: {
  //   padding: 10,
  //   marginBottom: 10,
  //   backgroundColor: "#f2f2f2",
  //   borderRadius: 5,
  // },
  image: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginBottom: 10,
    alignSelf: "center",
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  button: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    alignSelf: "flex-start",
  },
  buttonText: { color: "#fff" },
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
});

export default EditEventsScreen;
