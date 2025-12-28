import { View, Text, Image } from "react-native";
import { useAuthStore } from "../store/auth.store";
import styles from "../assets/styles/profile.styles";
import { formatMemberScience } from "../lib/utils";

export default function ProfileHeader() {
  const { user } = useAuthStore() as { user: any; token: string | null };

  if (!user) return null;

  return (
    <View style={styles.profileHeader}>
      <Image
        source={{ uri: user.profileImage || "https://via.placeholder.com/150" }}
        style={styles.profileImage}
      />
      <View style={styles.profileInfo}>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.memberSince}>
          🗓️ Joined {formatMemberScience(user.createdAt)}
        </Text>
      </View>
    </View>
  );
}
