// src/tests/CreateEventForm.test.tsx
import React, { useEffect } from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Provider, useDispatch } from "react-redux";
import configureStore from "redux-mock-store";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import CreateEventScreen from "../screens/CreateEventScreen";

// Мокаем expo-image-picker и expo-file-system
jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ granted: true })
  ),
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [
        {
          uri: "file://dummy-image.jpg",
        },
      ],
    })
  ),
}));

jest.mock("expo-file-system", () => ({
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true })),
}));

// Мокаем useDispatch, чтобы отследить dispatch
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => mockDispatch,
}));
jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});
// Мокаем навигацию для перехвата вызова navigate
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

// Мокаем API-хуки для получения категорий и создания события
const mockCreateEvent = jest.fn();
jest.mock("../api/api", () => ({
  useGetCategoriesQuery: () => ({
    data: [{ id: 1, name: "Music" }],
    error: null,
    isLoading: false,
  }),
  useCreateEventMutation: () => [mockCreateEvent, { isLoading: false }],
}));

// Мокаем AddressPickerModal, чтобы при открытии через useEffect устанавливать координаты
jest.mock("../components/AddressPickerModal", () => {
  const React = require("react");
  return ({ visible, onSelectLocation, onClose }) => {
    React.useEffect(() => {
      if (visible) {
        onSelectLocation([55.75, 37.61]);
        onClose();
      }
    }, [visible, onSelectLocation, onClose]);
    return null;
  };
});

const mockStore = configureStore([]);

const renderWithProviders = (store: any) => {
  return render(
    <Provider store={store}>
      <NavigationContainer>
        <CreateEventScreen navigation={{ navigate: mockNavigate }} />
      </NavigationContainer>
    </Provider>
  );
};

describe("CreateEventScreen - handleCreateEvent", () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockNavigate.mockClear();
    mockCreateEvent.mockClear();
  });

  it("должен вызывать showAlert с ошибкой, если обязательные поля не заполнены", async () => {
    const store = mockStore({});
    const { getByText } = renderWithProviders(store);

    // Нажимаем кнопку "Создать"
    const createButton = getByText("Создать");
    fireEvent.press(createButton);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: {
            message: "Пожалуйста, заполните все обязательные поля",
            type: "error",
          },
        })
      );
    });
  });

  it("должен создавать событие и переходить к 'Events', если обязательные поля заполнены", async () => {
    const store = mockStore({});
    const { getByPlaceholderText, getByText, getByTestId } =
      renderWithProviders(store);

    // Заполняем поле "Название"
    const nameInput = getByPlaceholderText("Название");
    fireEvent.changeText(nameInput, "Test Event");

    // Имитируем выбор категории:
    // Для этого в компоненте Picker добавьте testID="categoryPicker"
    const picker = getByTestId("categoryPicker");
    fireEvent(picker, "onValueChange", 1);

    // Нажимаем кнопку "Добавить категорию"
    const addCategoryButton = getByText("Добавить категорию");
    fireEvent.press(addCategoryButton);

    // Нажимаем на кнопку "Указать адрес" – благодаря замоканному AddressPickerModal координаты будут установлены
    const addressButton = getByText("Указать адрес");
    fireEvent.press(addressButton);

    // Мокаем успешный вызов createEvent с методом unwrap
    mockCreateEvent.mockImplementation(() => ({
      unwrap: () => Promise.resolve({ id: 123 }),
    }));

    // Нажимаем кнопку "Создать"
    const createButton = getByText("Создать");
    fireEvent.press(createButton);

    await waitFor(() => {
      expect(mockCreateEvent).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("Events");
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: {
            message: "Мероприятие успешно создано!",
            type: "success",
          },
        })
      );
    });
  });
});
