import Constants from "expo-constants";
const SERVER_URL =
  Constants.expoConfig?.extra?.SERVER_URL || "http://192.168.1.110:3000";
const DEFAULT_AVATAR = Constants.expoConfig?.extra?.DEFAULT_AVATAR;
const PROFILE_AVATAR =
  Constants.expoConfig?.extra?.PROFILE_AVATAR || "/uploads/users/default.svg";

export const getAvatarUri = (avatarUri: string | null, isEventType = true) => {
  const path = isEventType ? "events" : "users";
  if (!avatarUri) {
    // Если avatar отсутствует, используем defaultImage
    isEventType
      ? (avatarUri = `${DEFAULT_AVATAR}`)
      : (avatarUri = `${PROFILE_AVATAR}`);
  } else if (
    !avatarUri.startsWith("http://") &&
    avatarUri.includes("uploads")
  ) {
    const parts = avatarUri.includes("\\")
      ? avatarUri.split("\\")
      : avatarUri.split("/");
    avatarUri = `${SERVER_URL}/uploads/${path}/${parts.pop()}`;
  }

  return avatarUri;
};
