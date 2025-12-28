import {
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router';
import COLORS from '../../constants/colors'
import styles from '../../assets/styles/create.styles'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { API_URL } from '@/constants/api-url';
import { useAuthStore } from '@/store/auth.store';


export default function Create() {

  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [rating, setRating] = useState(3);
  const [coverImage, setCoverImage] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuthStore() as { token: string | null };

  const router = useRouter();

  const pickImage = async () => {
    try {
      // request permission to access media library if needed
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
          Alert.alert(
            'Permission required',
            'We need access to your photo library to continue.'
          );
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.6,
          base64: true,
        });

        if (result.canceled) return;

        const asset = result.assets[0];

        setCoverImage(asset.uri);

        if (asset.base64) {
          setImageBase64(asset.base64);
        } else {
          const base64 = await FileSystem.readAsStringAsync(asset.uri, {
            encoding: 'base64',
          });
          setImageBase64(base64);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while picking the image.');
      console.error('ImagePicker Error: ', error);
    }
  }

  const handleSubmit = async () => {
    if (!title.trim() || !caption.trim() || !imageBase64 || !rating) {
      Alert.alert('Validation Error', 'Please fill in all fields and select an image.');
      return;
    }


    try {
      setLoading(true);

      const uriParts = coverImage.split('.');
      const fileType = uriParts[uriParts.length - 1];
      const imageType = fileType ? `image/${fileType.toLowerCase()}` : 'image/jpeg';

      const imageDataUrl = `data:${imageType};base64,${imageBase64}`;
      console.log("token in create ", token);
      const response = await fetch(`${API_URL}/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title, caption, rating, coverImage: imageDataUrl
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Submission failed');
      }

      console.log('Submission successful:', data);
      setLoading(false);
      setTitle("");
      setCaption("");
      setCoverImage("");
      setImageBase64(null);
      setRating(3);

      router.push('/');

    } catch (error) {
      console.error('Submission Error: ', error);
      setLoading(false);
      Alert.alert('Error', 'An error occurred while submitting your book recommendation.');
    }

  }

  const renderRatingPicker = () => {
    const ratings = [];

    for (let i = 1; i <= 5; i++) {
      ratings.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)} style={styles.starButton}>
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={30}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      );
    }

    return <View style={styles.ratingContainer}>{ratings}</View>;
  }


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          {/* header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create a Recommendation</Text>
            <Text style={styles.subtitle}>Share your thoughts on a book.</Text>
          </View>
          <View style={styles.form}>

            {/* book title */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Book Title</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="book-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter the book title"
                  placeholderTextColor={COLORS.placeholderText}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>

            {/* book cover image */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Book Image</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {coverImage ? (
                  <Image
                    source={{ uri: coverImage }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Ionicons
                      name="image-outline"
                      size={40}
                      color={COLORS.placeholderText}
                    />
                    <Text style={styles.placeholderText}>Pick an image</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>


            {/* ratings */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Rating</Text>
              {renderRatingPicker()}
            </View>
            {/* caption */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Caption</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { height: 100 }]}
                  placeholder="Write your recommendation"
                  placeholderTextColor={COLORS.placeholderText}
                  value={caption}
                  onChangeText={setCaption}
                  multiline
                />
              </View>
            </View>

            {/* Share Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                (
                  <>
                    <Ionicons
                      name="cloud-upload-outline"
                      size={20}
                      color={COLORS.white}
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>Share</Text>
                  </>
                )
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView >
  )
}

