import { View, Text, Image, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'
import styles from "../../assets/styles/login.styles.js"
import { useState } from 'react'
import { Ionicons } from "@expo/vector-icons"
import COLORS from "../../constants/colors"
import { useAuthStore } from '../../store/auth.store'


const Login = () => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const isLoading = useAuthStore((state: any) => state.isLoading);
  const login = useAuthStore((state: any) => state.login);
  const isCheckingAuth = useAuthStore((state: any) => state.isCheckingAuth);


  const hendleLogin = async () => { 
    try {
      await login(email, password);
    } catch (error) {
      console.error("Login error:", error);
      // send alert to user in android app
      Alert.alert("Login Error", error instanceof Error ? error.message : "An error occurred during login");
    }
   }

   if (isCheckingAuth)  return null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <View style={styles.topIllustration}>
          <Image
            source={require("@/assets/images/i.png")}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
          <View style={styles.card}>
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>

                <Text style={styles.label}>Email</Text>

                <View style={styles.inputContainer}>

                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={COLORS.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={COLORS.placeholderText}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>

                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={COLORS.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={COLORS.placeholderText}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />

                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={COLORS.primary}
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.button}
                  onPress={hendleLogin}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Login</Text>
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>

          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

export default Login