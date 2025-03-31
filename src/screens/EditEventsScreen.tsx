import React from "react";
import { View, Text, FlatList, StyleSheet, Image } from "react-native";
import { useGetMyEventsQuery } from "../api/api";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import Constants from "expo-constants";
import { getAvatarUri } from "../lib/getAvatarUri";
import CustomButton from "../components/CustomButton";

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
          style={styles.avatar}
        />

        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.name}</Text>
          <Text>{item.description}</Text>
          <Text>
            {new Date(item.startDate).toLocaleDateString()} –{" "}
            {new Date(item.endDate).toLocaleDateString()}
          </Text>
        </View>

        <CustomButton
          style={styles.small}
          isSmall
          title="Изменить"
          onPress={() =>
            navigation.navigate("EditEventScreen", { event: item })
          }
        ></CustomButton>
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
  container: { flex: 1, padding: 10, paddingVertical: 24 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  title: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  button: {
    backgroundColor: "#fdc63b",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    alignSelf: "flex-start",
  },
  buttonText: { color: "#3c3c3c" },
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
  small: { maxWidth: 130 },
  textContainer: { flex: 1, minWidth: 100 },
  eventName: { fontSize: 18, fontWeight: "bold" },
});

export default EditEventsScreen;
