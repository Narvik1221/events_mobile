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
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  type = "default",
  style,
  ...props
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        type === "logout" ? styles.logoutButton : styles.defaultButton,
        style,
      ]}
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
    width: 300,
    maxWidth: 300,
    marginLeft: "auto",
    marginRight: "auto",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
    alignItems: "center",
    marginVertical: 5,
  },
  defaultButton: {
    backgroundColor: "#007BFF",
  },
  logoutButton: {
    backgroundColor: "#dc3545",
  },
  buttonText: {
    fontSize: 16,
  },
  defaultButtonText: {
    color: "#fff",
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default CustomButton;
