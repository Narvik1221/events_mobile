import React from "react";
import { Provider } from "react-redux";

import AppNavigator from "./src/navigation/AppNavigator"; // Ваш Stack/Tabs навигатор
import ErrorBoundary from "./src/components/ErrorBoundary"; // Импорт ErrorBoundary
import { store } from "./src/store/store"; // Redux store

export default function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <AppNavigator />
      </ErrorBoundary>
    </Provider>
  );
}
