import React, { ReactNode, useState } from "react";
import { View, Text, Button } from "react-native";
import CustomButton from "./CustomButton";

interface Props {
  children: ReactNode;
}

const ErrorBoundary: React.FC<Props> = ({ children }) => {
  const [error, setError] = useState<Error | null>(null);

  const resetError = () => {
    setError(null); // Сбрасываем ошибку
  };

  // Обработка ошибок через глобальный обработчик ошибок React
  React.useEffect(() => {
    const handleGlobalError = (error: Error) => {
      setError(error);
    };
    return () => {
      setError(null); // Очищаем ошибку при анмаунте
    };
  }, []);

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            color: "red",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Произошла ошибка: {error.message || "Неизвестная ошибка"}.
        </Text>
        <CustomButton title="Попробовать снова" onPress={resetError} />
      </View>
    );
  }

  return <>{children}</>; // Если ошибки нет, возвращаем дочерние компоненты
};

export default ErrorBoundary;
