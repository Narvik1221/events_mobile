import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
} from "react-native";

type ButtonType = "default" | "logout";

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  type?: ButtonType;
  isSmall?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  type = "default",
  isSmall = false,
  style,
  ...props
}) => {
  const typeStyles =
    type === "logout" ? styles.logoutButton : styles.defaultButton;
  return (
    <TouchableOpacity
      style={[styles.button, typeStyles, isSmall && styles.small, style]}
      {...props}
    >
      <Text
        style={[
          styles.buttonText,
          type === "logout"
            ? styles.logoutButtonText
            : styles.defaultButtonText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    maxWidth: 300,
    marginLeft: "auto",
    marginRight: "auto",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignItems: "center",
    marginVertical: 5,
  },
  small: {
    width: undefined,
    alignSelf: "flex-start",
  },
  defaultButton: {
    backgroundColor: "#fdc63b",
  },
  logoutButton: {
    backgroundColor: "#d9534f",
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  defaultButtonText: {
    color: "#000000",
  },
  logoutButtonText: {
    color: "#000000",
  },
});

export default CustomButton;
