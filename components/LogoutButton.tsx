import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useAuthStore } from "../store/auth.store";
import styles from "../assets/styles/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "@/constants/colors";

export default function LogoutButton() {
  const { logout } = useAuthStore() as { logout: () => Promise<void> };

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              logout();
            } catch (error) {
              Alert.alert("Error", "An error occurred while logging out.");
            }
          },
        },
      ],
      { cancelable: true }
    )
  };

  return (
    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
      <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  );
}