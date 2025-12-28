import { useAuthStore } from '../../store/auth.store';
import { Stack, useRouter } from "expo-router";
import { use, useEffect } from "react";

export default function AuthLayout() {
  const router = useRouter();
  const { user, token, checkAuth } = useAuthStore() as { user: any; token: string | null; checkAuth: () => void };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && token) {
      router.replace("/(tabs)");
    }
  }, [user, token]);
  return <Stack screenOptions={{ headerShown: false }} />;
}
