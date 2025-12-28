import { create } from "zustand"; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from "../constants/api-url";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isCheckingAuth: true,

  register: async (userName : string, email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName, email, password }),
      });

      
      
      const data = await response.json();
      if (!response.ok)   throw new Error(data.message || "Registration failed");
      
      console.log(`response from sercer ${data.user}`);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await AsyncStorage.setItem('token', data.token);

      set({ user: data.user, token: data.token, isLoading: false });

      return { success: true, message: "Registration successful" };
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const storedToken = await AsyncStorage.getItem('token');
  
      if (storedUser && storedToken) {
        set({ user: JSON.parse(storedUser), token: storedToken });
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await AsyncStorage.setItem('token', data.token);

      set({ user: data.user, token: data.token, isLoading: false });

      return { success: true, message: "Login successful" };
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));