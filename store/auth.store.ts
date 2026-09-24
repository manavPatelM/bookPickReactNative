import { create } from "zustand"; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from "../constants/api-url";

/** Safely parse JSON — throws a readable error if backend returns HTML instead */
const safeJson = async (response: Response) => {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    console.error(`Non-JSON response (${response.status}):`, text.slice(0, 300));
    throw new Error(`Server error (${response.status}). Please try again later.`);
  }
  return response.json();
};

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isCheckingAuth: true,

  register: async (userName: string, email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName, email, password }),
      });

      const data = await safeJson(response);
      if (!response.ok) throw new Error(data.message || "Registration failed");

      console.log(`response from server:`, data.user);
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

      const data = await safeJson(response);
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