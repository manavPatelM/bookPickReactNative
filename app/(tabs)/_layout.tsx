import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { Tabs, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import COLORS from '@/constants/colors'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuthStore } from '@/store/auth.store'

export default function TabLayout() {

  const router = useRouter();
  const { user, token } = useAuthStore() as { user: any; token: string | null };

  useEffect(() => {
    if (!user || !token) {
      router.replace("/(auth)");
    }
  }, [user, token]);

  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        headerTitleStyle: {
          color: COLORS.textPrimary,
          fontWeight: "600"
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: COLORS.cardBackground,
          borderTopColor: COLORS.border,
          paddingTop: 5,
          height: 60+insets.bottom,
          paddingBottom: insets.bottom
        }
       }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarLabel: 'Create',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  )
}