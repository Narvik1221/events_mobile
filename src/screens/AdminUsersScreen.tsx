import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Alert } from "react-native";
import { useGetUsersQuery, useToggleUserBlockMutation } from "../api/api";
import CustomButton from "../components/CustomButton";

const AdminEventsScreen: React.FC = () => {
  const {
    data: users,
    error,
    isLoading,
    refetch,
  } = useGetUsersQuery(null as any);
  const [toggleUserBlock, { isLoading: isToggling }] =
    useToggleUserBlockMutation();

  useEffect(() => {
    refetch();
  }, []);

  const handleToggleBlock = async (userId: number, isBlocked: boolean) => {
    try {
      await toggleUserBlock({ userId, blocked: !isBlocked }).unwrap();
      refetch();
    } catch (err) {
      Alert.alert("Ошибка", "Не удалось изменить статус пользователя.");
    }
  };

  if (isLoading) return <Text>Загрузка пользователей...</Text>;
  if (error) return <Text>Ошибка загрузки</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Пользователи</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Text style={styles.userText}>
              {item.firstName} {item.lastName}
            </Text>
            <Text style={styles.status}>
              {item.blocked ? "Заблокирован" : "Активен"}
            </Text>
            <CustomButton
              type="logout"
              title={item.blocked ? "Разблокировать" : "Заблокировать"}
              onPress={() => handleToggleBlock(item.id, item.blocked)}
              disabled={isToggling}
              style={{
                backgroundColor: item.blocked ? "#1b7c46" : "#ff0000",
              }}
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingVertical: 24,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: "center",
  },
  userCard: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#cad3e5",
    marginBottom: 10,
  },
  userText: {
    fontSize: 18,
  },
  status: {
    fontSize: 14,
    color: "gray",
  },
});

export default AdminEventsScreen;
