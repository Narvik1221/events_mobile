export default ({ config }) => ({
  ...config,
  name: "MyEventsApp",
  slug: "eventsapp",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        "Это приложение использует ваше местоположение для показа событий рядом с вами.",
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"],
    package: "com.andrey.eventsapp",
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  extra: {
    SERVER_URL: process.env.SERVER_URL,
    DEFAULT_AVATAR: process.env.DEFAULT_AVATAR,
    PROFILE_AVATAR: process.env.PROFILE_AVATAR,
    API_LOCAL_URL: process.env.API_LOCAL_URL,
    eas: {
      projectId: "4caf7b54-6f14-4801-a4d2-1b75c365f5d3",
    },
  },
  plugins: ["expo-asset"],
  owner: "andrey1221",
});
