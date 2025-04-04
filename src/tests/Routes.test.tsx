// src/tests/App.test.tsx
import React, { useEffect } from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Provider, useDispatch } from "react-redux";
import configureStore from "redux-mock-store";
import { NavigationContainer, useNavigation } from "@react-navigation/native";

// Импортируем компоненты, которые тестируются
import CreateEventScreen from "../screens/CreateEventScreen";
import BottomNavBar from "../components/BottomNavbar";

// ==========================
// Моки для обоих тестов
// ==========================

// Мокаем expo-image-picker и expo-file-system для CreateEventScreen
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

// Мокаем useDispatch, чтобы отследить dispatch в CreateEventScreen
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => mockDispatch,
}));
jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});

// Мокаем навигацию для обоих тестов
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

// Мокаем API-хуки для получения категорий и создания события (CreateEventScreen)
const mockCreateEvent = jest.fn();
jest.mock("../api/api", () => ({
  useGetCategoriesQuery: () => ({
    data: [{ id: 1, name: "Music" }],
    error: null,
    isLoading: false,
  }),
  useCreateEventMutation: () => [mockCreateEvent, { isLoading: false }],
}));

// Мокаем AddressPickerModal, чтобы при открытии через useEffect устанавливать координаты (CreateEventScreen)
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

// Создаем мок-стор для redux
const mockStore = configureStore([]);

// Функция-обёртка для тестов CreateEventScreen
const renderWithProviders = (store: any) => {
  return render(
    <Provider store={store}>
      <NavigationContainer>
        <CreateEventScreen navigation={{ navigate: mockNavigate }} />
      </NavigationContainer>
    </Provider>
  );
};

// Функция-обёртка для тестов BottomNavBar
const renderWithStore = (store: any) => {
  return render(
    <Provider store={store}>
      <NavigationContainer>
        <BottomNavBar />
      </NavigationContainer>
    </Provider>
  );
};

// ==========================
// Тесты для CreateEventScreen
// ==========================
describe("Тестирование функции создания мероприятий", () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockNavigate.mockClear();
    mockCreateEvent.mockClear();
  });

  it("Вызов сообщение с ошибкой, если обязательные поля не заполнены", async () => {
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

  it("Создание событие и переход на главный экран, если обязательные поля заполнены", async () => {
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

// ==========================
// Тесты для BottomNavBar
// ==========================
describe("Тестирование аутентификации пользователя и проверки его роли", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("отображает все testID для обычного пользователя", () => {
    const initialState = {
      auth: { accessToken: "dummy-token" },
      user: { isAdmin: false },
    };
    const store = mockStore(initialState);
    const { getByTestId } = renderWithStore(store);

    expect(getByTestId("EventsButton")).toBeTruthy();
    expect(getByTestId("CreateEventButton")).toBeTruthy();
    expect(getByTestId("FavoritesButton")).toBeTruthy();
    expect(getByTestId("ProfileButton")).toBeTruthy();
  });

  it("отображает все testID для администратора", () => {
    const initialState = {
      auth: { accessToken: "dummy-token" },
      user: { isAdmin: true },
    };
    const store = mockStore(initialState);
    const { getByTestId, queryByTestId } = renderWithStore(store);

    expect(getByTestId("AdminEventsButton")).toBeTruthy();
    expect(getByTestId("AdminUsersButton")).toBeTruthy();
    expect(getByTestId("ProfileButton")).toBeTruthy();

    expect(queryByTestId("EventsButton")).toBeNull();
    expect(queryByTestId("CreateEventButton")).toBeNull();
    expect(queryByTestId("FavoritesButton")).toBeNull();
  });

  it("при наличии token кнопка CreateEvent  навигирует к 'CreateEvent'", () => {
    const initialState = {
      auth: { accessToken: "dummy-token" },
      user: { isAdmin: false },
    };
    const store = mockStore(initialState);
    const { getByTestId } = renderWithStore(store);

    fireEvent.press(getByTestId("CreateEventButton"));
    expect(mockNavigate).toHaveBeenCalledWith("CreateEvent");
  });

  it("при отсутствии token кнопка CreateEvent  навигирует к 'Login'", () => {
    const initialState = {
      auth: { accessToken: "" }, // токен отсутствует
      user: { isAdmin: false },
    };
    const store = mockStore(initialState);
    const { getByTestId } = renderWithStore(store);

    fireEvent.press(getByTestId("CreateEventButton"));
    expect(mockNavigate).toHaveBeenCalledWith("Login");
  });
});
